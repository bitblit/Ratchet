import { ParsedEmailProcessor } from './parsed-email-processor.js';
import { ParsedMail } from 'mailparser';
import { Logger, RequireRatchet } from '@bitblit/ratchet-common';
import { CsvRatchet, MultiStream } from '@bitblit/ratchet-node-only';
import unzipper from 'unzipper';
import { DateTime } from 'luxon';
import { injectable } from "tsyringe";

@injectable()
export class EmailToDbInsertProcessor implements ParsedEmailProcessor<EmailToDbStatement[]> {
  public canProcess(mail: ParsedMail): boolean {
    return true;
  }

  public async processEmail(msg: ParsedMail): Promise<EmailToDbStatement[]> {
    const rval: EmailToDbStatement[] = [];
    try {
      RequireRatchet.notNullOrUndefined(msg, 'msg');
      Logger.info('Processing Broadsign reach inbound inventory email');
      const data: Buffer = msg.attachments[0].content;

      Logger.info('Unzipping attachment');
      const rs: MultiStream = new MultiStream(data);
      let wBuf: Buffer = null;
      const prom: Promise<any> = rs
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          if (entry.path.toLowerCase().endsWith('csv')) {
            wBuf = await entry.buffer();
          } else {
            Logger.info('Pass: %s', entry.path);
            entry.autodrain();
          }
        })
        .promise();
      await prom;
      const csvParsed: any[] = await CsvRatchet.stringParse(wBuf.toString(), (o) => o, {
        columns: false,
        skip_empty_lines: true,
      });

      if (csvParsed.length > 1) {
        const dropTable: string = 'drop table if exists sample';
        let createTable: string = 'create table sample (pump_date varchar(255),';
        const colNames: string[] = csvParsed[0];

        let insertPrefix: string = 'insert into sample (pump_date,';
        let insertQ: string = '?,';

        for (let i = 0; i < colNames.length; i++) {
          if (i > 0) {
            createTable += ', ';
            insertPrefix += ', ';
            insertQ += ', ';
          }
          const kOut: string = colNames[i].toLowerCase().split(' ').join('_');
          insertPrefix += kOut;
          insertQ += '?';
          createTable += kOut + ' varchar(255)';
          if (kOut === 'id') {
            createTable += ' primary key';
          } else if (kOut === 'device_id') {
            createTable += ' unique';
          }
        }
        createTable += ')';
        insertPrefix += ') values ';
        // ('+insertQ+')';

        Logger.info('Recreating table');
        const dropRes: any = rval.push({ statement: dropTable });
        const createRes: any = rval.push({ statement: createTable });
        const pumpDate: string = DateTime.utc().toISO();
        let insertStmt: string = insertPrefix;
        let insertParams: any[] = [];

        for (let i = 1; i < csvParsed.length; i++) {
          if (insertStmt > insertPrefix) {
            insertStmt += ',';
          }
          insertStmt += '(' + insertQ + ')';
          insertParams = insertParams.concat(pumpDate, csvParsed[i]);

          if (i % 25 === 0 || i === csvParsed.length - 1) {
            rval.push({ statement: insertStmt, params: insertParams });
            insertStmt = insertPrefix;
            insertParams = [];
            Logger.info('Inserted %d of %d rows', i, csvParsed.length);
          }
        }

        Logger.info('Finished insertion of %d rows', csvParsed.length);
      }
    } catch (err) {
      Logger.error('Failure: %s : %j', err, rval, err);
    }

    return rval;
  }
}

export interface EmailToDbStatement {
  statement: string;
  params?: any[];
}

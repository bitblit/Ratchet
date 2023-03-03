import { ParsedMail, simpleParser } from 'mailparser';
import { Readable, ReadableOptions } from 'stream';
import { S3CacheRatchet } from '../../aws/s3/s3-cache-ratchet';
import { RequireRatchet } from '../../common/require-ratchet';
import { Logger } from '../../common/logger';

/**
 * Service for handling inbound emails
 */
export class InboundEmailRatchet {
  constructor(private cache: S3CacheRatchet) {
    RequireRatchet.notNullOrUndefined(this.cache, 'cache');
    RequireRatchet.notNullOrUndefined(this.cache.getDefaultBucket(), 'cache.defaultBucket');
  }

  public async processEmailFromS3(key: string): Promise<boolean> {
    const rval: boolean = false;
    if (await this.cache.fileExists(key)) {
      const data: string = await this.cache.fetchCacheFileAsString(key);
      return this.processEmailFromBuffer(new Buffer(data));
    } else {
      Logger.warn('Cannot process inbound email - no such key : %s', key);
    }

    return rval;
  }

  public async processEmailFromBuffer(buf: Buffer): Promise<boolean> {
    const rval: boolean = false;
    RequireRatchet.notNullOrUndefined(buf, 'buf');
    Logger.info('Processing inbound email - size %d bytes', buf.length);

    const message: ParsedMail = await simpleParser(buf);
    Logger.info('Found mail from "%s" subject "%s" with %d attachments', message.from.text, message.subject, message.attachments.length);

    // Here will be the switch that handles multiple different email processors
    if (
      !!message &&
      !!message.subject &&
      message.subject.toLowerCase().startsWith('reach inventory') &&
      !!message.attachments &&
      message.attachments.length === 1 &&
      message.attachments[0].contentType.toLowerCase() === 'application/zip'
    ) {
      // rval = await this.processBroadsignReachInventoryEmail(message);
    } else {
      Logger.info('Unrecognized email - not processing');
    }

    return rval;
  }

  /*
  CAW 2022-02-25 : Leaving in here just as an example for now
  public async processSampleEmail(msg: ParsedMail): Promise<boolean> {
    let rval: boolean = false;
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
      const csvParsed: any[] = parse(wBuf.toString(), {
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
        const dropRes: any = await this.db.executeQuery(dropTable);
        const createRes: any = await this.db.executeQuery(createTable);
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
            const insRes: any = await this.db.executeQuery(insertStmt, insertParams);
            insertStmt = insertPrefix;
            insertParams = [];
            Logger.info('Inserted %d of %d rows', i, csvParsed.length);
          }
        }

        Logger.info('Finished insertion of %d rows', csvParsed.length);

        rval = true;
      }
    } catch (err) {
      Logger.error('Failure: %s', err, err);
    }

    return rval;
  }

   */
}

export class MultiStream extends Readable {
  _object: any;

  constructor(object: any, options: ReadableOptions = {}) {
    super(object instanceof Buffer || typeof object === 'string' ? options : { objectMode: true });
    this._object = object;
  }

  _read() {
    this.push(this._object);
    this._object = null;
  }
}

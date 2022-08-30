import { readFileSync, ReadStream } from 'fs';
import path from 'path';
import { AthenaRatchet } from './athena-ratchet.js';
import { Logger } from '../../common/logger.js';
import { RequireRatchet } from '../../common/require-ratchet.js';
import { StringRatchet } from '../../common/string-ratchet.js';
import { S3Ratchet } from '../../aws/s3-ratchet.js';
import { CsvRatchet } from '../../node-csv/csv-ratchet.js';
import { URL, fileURLToPath } from 'url';

// A class to simplify reading an Athena table based on ALB Logs
// NOTE: This class only runs on Node since it depends on fs and path
export class AlbAthenaLogRatchet {
  constructor(private athena: AthenaRatchet, private athenaTableName: string) {
    RequireRatchet.notNullOrUndefined(athena, 'athena');
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(athenaTableName), 'athenaTableName');
  }

  private static getLocalDirName(): string {
    return fileURLToPath(new URL('.', import.meta.url));
  }

  public async updatePartitions(
    rootPath: string,
    s3: AWS.S3,
    startTimeEpochMS: number = new Date().getTime() - 1000 * 60 * 60 * 24,
    endTimeEpochMS: number = new Date().getTime()
  ): Promise<string[]> {
    RequireRatchet.true(S3Ratchet.checkS3UrlForValidity(rootPath), 'root path not valid');
    RequireRatchet.notNullOrUndefined(s3, 's3');
    Logger.info('Updating partitions for %s from %s', this.athenaTableName, rootPath);
    const bucketName: string = S3Ratchet.extractBucketFromURL(rootPath);
    const rootKey: string = S3Ratchet.extractKeyFromURL(rootPath);

    let current: number = startTimeEpochMS;
    const clauses: string[] = [];
    while (current < endTimeEpochMS) {
      const dateUtcVal: string = new Date(current).toISOString().substring(0, 10);
      Logger.info('d:%s', dateUtcVal);
      const dateParts: string[] = dateUtcVal.split('-');
      clauses.push(
        "PARTITION (date_utc_partition='" +
          dateUtcVal +
          "') LOCATION '" +
          rootPath +
          '/' +
          dateParts[0] +
          '/' +
          dateParts[1] +
          '/' +
          dateParts[2] +
          "'"
      );
      current += 1000 * 60 * 60 * 24;
    }
    if (clauses.length > 0) {
      const stmt: string = 'ALTER TABLE ' + this.athenaTableName + ' ADD IF NOT EXISTS \n' + clauses.join('\n');
      await this.athena.runQueryToObjects<any>(stmt);
    } else {
      Logger.warn('Not updating partitions - no time between time clauses');
    }
    return clauses;
  }

  public async createTable(rootPath: string, replaceIfPresent: boolean = false): Promise<boolean> {
    RequireRatchet.true(S3Ratchet.checkS3UrlForValidity(rootPath), 'root path not valid');
    let rval: boolean = false;
    Logger.info('Creating ALB table %s', this.athenaTableName);
    if (replaceIfPresent) {
      Logger.info('Replace if present specified, removed old table');
      try {
        await this.athena.runQueryToObjects<any>('drop table ' + this.athenaTableName);
      } catch (err) {
        Logger.info('Drop error : %j', err);
      }
    }

    let tableCreateQry: string = readFileSync(
      path.join(AlbAthenaLogRatchet.getLocalDirName(), '../static/albAthenaTableCreate.txt')
    ).toString();
    tableCreateQry = tableCreateQry.split('{{TABLE NAME}}').join(this.athenaTableName);
    tableCreateQry = tableCreateQry.split('{{ALB_LOG_ROOT}}').join(rootPath);
    Logger.info('Creating table with %s', tableCreateQry);

    try {
      await this.athena.runQueryToObjects<any>(tableCreateQry);
      rval = true;
    } catch (err) {
      Logger.error('Error creating table : %s', err);
    }
    return rval;
  }

  public static async readLogObjectsFromCsvStream(readStream: ReadStream): Promise<AlbLogRecord[]> {
    return CsvRatchet.streamParse(readStream, (p) => p);
  }

  public static async readLogObjectsFromFile(fileName: string): Promise<AlbLogRecord[]> {
    return CsvRatchet.fileParse(fileName, (p) => p);
  }

  public async fetchAlbLogRecords(qry: AlbLogRecordQuery): Promise<AlbLogRecord[]> {
    const tempFile: string = await this.fetchAlbLogRecordsToFile(qry);
    return AlbAthenaLogRatchet.readLogObjectsFromFile(tempFile);
  }

  public async fetchAlbLogRecordsToFile(qry: AlbLogRecordQuery, outputFileName: string = null): Promise<string> {
    Logger.info('Querying %s : %j', this.athenaTableName, qry);

    let qrySt: string = 'select * from ' + this.athenaTableName + ' where 1=1 ';
    if (qry.startTimeEpochMS) {
      // Dates use the partition for speed and time column for accuracy
      if (qry.startTimeEpochMS) {
        qrySt += " AND time >= '" + new Date(qry.startTimeEpochMS).toISOString() + "'";
        qrySt += " AND date_utc_partition >='" + new Date(qry.startTimeEpochMS).toISOString().substring(0, 10) + "'";
      }
      if (qry.endTimeEpochMS) {
        qrySt += " AND time < '" + new Date(qry.endTimeEpochMS).toISOString() + "'";
        qrySt += " AND date_utc_partition <='" + new Date(qry.endTimeEpochMS).toISOString().substring(0, 10) + "'";
      }
      if (qry.requestUrlFilter) {
        qrySt += " AND request_url LIKE '" + qry.requestUrlFilter + "'";
      }
      if (qry.limit) {
        qrySt += ' LIMIT ' + qry.limit;
      }
    }

    const result: string = await this.athena.runQueryToFile(qrySt, null, outputFileName);
    return result;
  }
}

export interface AlbLogRecordQuery {
  startTimeEpochMS?: number;
  endTimeEpochMS?: number;
  requestUrlFilter?: string;
  limit?: number;
}

// Matches the fields that Alb stores natively
export interface AlbLogRecord {
  type: string;
  time: string;
  elb: string;
  client_ip: string;
  client_port: string;
  target_ip: string;
  target_port: string;
  request_processing_time: string;
  target_processing_time: string;
  response_processing_time: string;
  elb_status_code: string;
  target_status_code: string;
  received_bytes: string;
  sent_bytes: string;
  request_verb: string;
  request_url: string;
  request_proto: string;
  user_agent: string;
  ssl_cipher: string;
  ssl_protocol: string;
  target_group_arn: string;
  trace_id: string;
  domain_name: string;
  chosen_cert_arn: string;
  matched_rule_priority: string;
  request_creation_time: string;
  actions_executed: string;
  redirect_url: string;
  lambda_error_reason: string;
  target_port_list: string;
  target_status_code_list: string;
  new_field: string;
  date_utc_partition: string;
}

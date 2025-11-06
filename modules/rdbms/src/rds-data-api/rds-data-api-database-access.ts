import { DatabaseAccess } from "../model/database-access.js";
import { ModifyResults } from "../model/modify-results.js";
import { RequestResults } from "../model/request-results.js";
import {
  BeginTransactionCommand,
  BeginTransactionCommandOutput,
  CommitTransactionCommand, CommitTransactionCommandOutput,
  DatabaseResumingException, ExecuteStatementCommand, ExecuteStatementCommandOutput,
  Field,
  RDSDataClient, RollbackTransactionCommand, RollbackTransactionCommandOutput, SqlParameter
} from "@aws-sdk/client-rds-data";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { RdsDataApiConnectionConfig } from "./model/rds-data-api-connection-config.ts";
import SqlString from 'sqlstring';
import type { Command } from "@smithy/types";
import { SmithyResolvedConfiguration } from "@smithy/smithy-client/dist-types/client";
import { PromiseRatchet } from "@bitblit/ratchet-common/lang/promise-ratchet";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";

export class RdsDataApiDatabaseAccess implements DatabaseAccess {

  private _currentTransactionId: string;

  constructor(
    private client: RDSDataClient,
    private cfg: RdsDataApiConnectionConfig,
  ) {}

  private get maxWaitForResumingDatabase(): number {
    return this?.cfg?.maximumWaitForDbResumeInMillis ?? 0; // Default to no waiting
  }

  private get dbResumePingTimeMillis(): number {
    return this?.cfg?.dbResumePingTimeMillis ?? 1_000; // Default to 1 second
  }

  public async sendWithDatabaseWait(cmd: any): Promise<any> {
    const startTime: number = Date.now();
    let rval: any;
    do {
      try {
        rval = await this.client.send(cmd);
      } catch (err) {
        if (err instanceof DatabaseResumingException) {
          Logger.debug('Database was resuming - waiting %d ms before retry : %s', this.dbResumePingTimeMillis, err);
          await PromiseRatchet.wait(this.dbResumePingTimeMillis);
        } else {
          throw err;
        }
      }
    } while (!rval && Date.now()-startTime < this.maxWaitForResumingDatabase)
    if (!rval) {
      Logger.error('Timed out waiting for db to start');
      throw ErrorRatchet.fErr('Timed out waiting for db to start');
    }
    return rval;
  }


  public async beginTransaction(): Promise<void> {
    const tmp: BeginTransactionCommandOutput = await this.sendWithDatabaseWait(new BeginTransactionCommand({ resourceArn: this.cfg.resourceArn, secretArn: this.cfg.secretArn}))
    this._currentTransactionId = tmp.transactionId;
    Logger.info('Started transaction %s', this._currentTransactionId);
  }

  public async close(): Promise<boolean> {
    if (!this._currentTransactionId) {
      Logger.info('Close called with transaction still open, rolling back');
      await this.rollbackTransaction();
    }
    return true;
    // TODO: anything else?
  }

  public async commitTransaction(): Promise<void> {
    if (this._currentTransactionId) {
      const out: CommitTransactionCommandOutput = await this.sendWithDatabaseWait(new CommitTransactionCommand({resourceArn: this.cfg.resourceArn, secretArn: this.cfg.secretArn, transactionId: this._currentTransactionId}))
      Logger.info('Commit transaction %s returned %j', this._currentTransactionId, out);
      this._currentTransactionId = null;
    } else {
      Logger.warn('Commit transaction called while no transaction in session');
    }
  }

  public escape(value: any): string {
    const rval: string = SqlString.escape(value);
    return rval;
  }

  public async modify(query: string, fields: Record<string, any>): Promise<RequestResults<ModifyResults>> {
    const params: SqlParameter[] = RdsDataApiDatabaseAccess.toSqlParameters(fields);
    const tmp: ExecuteStatementCommandOutput = await this.sendWithDatabaseWait(new ExecuteStatementCommand({resourceArn: this.cfg.resourceArn, secretArn: this.cfg.secretArn, database: this.cfg.database, sql:query, parameters: params, includeResultMetadata: true}));
    const rval: RequestResults<ModifyResults> = {
      results: {
        changedRows: tmp.numberOfRecordsUpdated,
        //insertId: tmp.generatedFields,
        //fieldCount: tmp.generatedFields.length,
        affectedRows: tmp.numberOfRecordsUpdated
        //info: string;
        //serverStatus?: number;
        //warningStatus?: number;
      },
      fields: tmp.columnMetadata
    };
    return rval;
  }


  public static toSqlParameters(record: Record<string, any>): SqlParameter[] {
    return Object.entries(record).map(([key, val]) => {
      let value: any;
      if (val === null) {
        value = { isNull: true };
      } else if (typeof val === "number") {
        // choose longValue or doubleValue depending on your case
        value = { longValue: val };
      } else if (typeof val === "boolean") {
        value = { booleanValue: val };
      } else if (val instanceof Date) {
        value = { stringValue: val.toISOString(), typeHint: "TIMESTAMP" };
      } else {
        // assume string
        value = { stringValue: String(val) };
      }
      return { name: key, value };
    });
  }

  public static fieldToValue(field: Field): any {
    let rval: any = null;
    if (field.isNull)  { rval=null}
    else if (field.stringValue !== undefined) {rval= field.stringValue;}
    else if (field.blobValue !== undefined) {rval= Buffer.from(field.blobValue);}
    else if (field.doubleValue !== undefined) {rval= field.doubleValue;}
    else if (field.longValue !== undefined) {rval= field.longValue;}
    else if (field.booleanValue !== undefined) {rval= field['booleanValue']}; // For some reason shows up as nevertype?}
    return rval;
  }

  public static parseRecords<T>(
    output: ExecuteStatementCommandOutput
  ): T[] {
    const { records, columnMetadata } = output;
    if (!records || !columnMetadata) return [];

    const rval: T[] = records.map((row) => {
      const obj: T = {} as T;
      row.forEach((field, i) => {
        const name = columnMetadata[i].name || `col${i}`;
        obj[name] = RdsDataApiDatabaseAccess.fieldToValue(field);
      });
      return obj;
    });
    return rval;
  }

  public async query<S>(query: string, fields: Record<string, any>): Promise<RequestResults<S>> {
    const params: SqlParameter[] = RdsDataApiDatabaseAccess.toSqlParameters(fields);

    const _tmp: ExecuteStatementCommandOutput = await this.client.send(new ExecuteStatementCommand({resourceArn: this.cfg.resourceArn, secretArn: this.cfg.secretArn, database: this.cfg.database, sql:query, parameters: params, includeResultMetadata: true}));
    Logger.info('tmp: %j cm: %j', _tmp.records, _tmp.columnMetadata);
    const records: S[] = RdsDataApiDatabaseAccess.parseRecords<S>(_tmp);

    const rval: RequestResults<S> = {
      results: records as S,
      fields: _tmp.columnMetadata ?? []
    };
    return rval;
  }

  public async rollbackTransaction(): Promise<void> {
    if (this._currentTransactionId) {
      const out: RollbackTransactionCommandOutput = await this.client.send(new RollbackTransactionCommand({resourceArn: this.cfg.resourceArn, secretArn: this.cfg.secretArn, transactionId: this._currentTransactionId}));
      Logger.info('Rollback transaction %s returned %j', this._currentTransactionId, out);
      this._currentTransactionId = null;
    } else {
      Logger.warn('Rollback transaction called while no transaction in session');
    }
  }

  public async testConnection(logTestResults?: boolean): Promise<number> {
    const output: RequestResults<any> = await this.query<any>('SELECT 1 AS test_result', {}); // SELECT version()
    if (logTestResults) {
      Logger.info('Test connection returned %j', output);
    }
    const rval: number = output?.results?.length ? output.results[0]['test_result'] : null;
    return rval;
  }


  /*
  public async onRequestFailureOnly(type: DatabaseRequestType): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async onRequestSuccessOnly(type: DatabaseRequestType): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async onRequestSuccessOrFailure(type: DatabaseRequestType): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async preQuery(): Promise<void> {
    return Promise.resolve(undefined);
  }

   */
}

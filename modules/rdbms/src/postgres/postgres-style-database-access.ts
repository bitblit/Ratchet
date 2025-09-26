import { DatabaseAccess } from '../model/database-access.js';
import { RequestResults } from '../model/request-results.js';
import { ModifyResults } from '../model/modify-results.js';
import { DatabaseRequestType } from '../model/database-request-type.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { PostgresDbConfig } from "./model/postgres-db-config.ts";
import { Client, Result } from 'pg'
import SqlString from 'sqlstring';
import { NamedParameterAdapter } from "../util/named-parameter-adapter/named-parameter-adapter.ts";
import { QueryAndParams } from "../util/named-parameter-adapter/query-and-params.ts";

export class PostgresStyleDatabaseAccess implements DatabaseAccess {
  constructor(
    private _connection: Client,
    private _connectionOptions: PostgresDbConfig,
  ) {}

  public async testConnection(logTestResults?: boolean): Promise<number | null> {
    if (logTestResults) {
      Logger.info('Running connection test');
    }

    const res: RequestResults<any> = await this.query(this.testConnectionQueryString(), {});
    const rows = res.results as { test: number }[];
    const timestamp = rows.length === 1 ? rows[0].test : null;
    if (logTestResults) {
      Logger.info('Test returned : %j', timestamp);
    }
    return timestamp;
  }

  public getRawDatabase(): Client {
    return this._connection;
  }

  public getRawDatabaseConfig(): PostgresDbConfig {
    return this._connectionOptions;
  }

  public testConnectionQueryString(): string {
    return 'SELECT 1 AS test';
  }

  public async close(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public escape(query: any): string {
    return SqlString.escape(query);
  }

  public async preQuery(): Promise<void> {
    // Do nothing
  }

  public async query<R>(query, fields): Promise<RequestResults<R>> {
    const qap: QueryAndParams = NamedParameterAdapter.applyNamedValuesToQuery({query: query, params: fields});
    //const formatted: string =  SqlString.format(query, fields);
    const formatted: string =  SqlString.format(qap.query, {});
    const res:Result = await this._connection.query(formatted);

    const rval: RequestResults<R> = {
      results: res.rows as R,
      fields: res.fields
    }

    return rval;
  }

  public async modify(query: string, fields: Record<string, any>): Promise<RequestResults<ModifyResults>> {
    const qap: QueryAndParams = NamedParameterAdapter.applyNamedValuesToQuery({query: query, params: fields});
    const formatted: string =  SqlString.format(qap.query, {});
    const res:Result = await this._connection.query(formatted);

    let insertId: number = null;
    if (res?.rows?.length) {
      // This means the insert did a "returning" clause
      const r: Record<string,any> = res.rows[0];
      const keyName: string = Object.keys(r)[0];
      insertId = r[keyName];
    }

    const mr: ModifyResults = {
      changedRows: res.rowCount,
      insertId: insertId
    };

    const rval: RequestResults<ModifyResults> = {
      results: mr,
      fields: null
    };

    return rval;
  }

  public async onRequestSuccessOrFailure(_type: DatabaseRequestType): Promise<void> {
    // Do nothing
  }

  /*
  public async onQueryFailureOnly(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async onQuerySuccessOnly(): Promise<void> {
    return Promise.resolve(undefined);
  }

   */
}

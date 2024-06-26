import { AsyncDatabase } from 'promised-sqlite3';
import { ErrorRatchet, Logger, RemoteFileSyncLike } from '@bitblit/ratchet-common';
import SqlString from 'sqlstring';
import { DatabaseAccess } from "../model/database-access.js";
import { DatabaseRequestType } from "../model/database-request-type.js";
import { ModifyResults } from "../model/modify-results.js";
import { RequestResults } from "../model/request-results.js";
import { QueryUtil } from "../query-builder/query-util.js";
import { SqliteConnectionConfigFlag } from "./model/sqlite-connection-config-flag";

export class SqliteDatabaseAccess implements DatabaseAccess {
  constructor(
    private conn: AsyncDatabase,
    private flags: SqliteConnectionConfigFlag[],
    private extraConfig: Record<string, any>,
  ) {}

  get connection(): AsyncDatabase {
    return this.conn;
  }

  beginTransaction(): Promise<void> {
    throw ErrorRatchet.fErr('Transactions not supported in Sqlite');
  }

  async close(): Promise<boolean> {
    try {
      await this.conn.close();
      return true;
    } catch (err) {
      Logger.error('Failed to close : %s', err, err);
      return false;
    }
  }

  commitTransaction(): Promise<void> {
    throw ErrorRatchet.fErr('Transactions not supported in Sqlite');
  }

  escape(value: any): string {
    return SqlString.escape(value);
  }

  async onRequestFailureOnly(_type: DatabaseRequestType): Promise<void> {}

  async onRequestSuccessOnly(_type: DatabaseRequestType): Promise<void> {
    return Promise.resolve(undefined);
  }

  async onRequestSuccessOrFailure(_type: DatabaseRequestType): Promise<void> {
    return Promise.resolve(undefined);
  }

  async preQuery(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async modify(query: string, fields: Record<string, any>): Promise<RequestResults<ModifyResults>> {
    const out: RequestResults<any> = await this.query<any>(query, fields);
    Logger.debug('Modify returned %j', out);
    const val: any[] = await this.conn.all<any>('SELECT changes() as changedRows, last_insert_rowid() as insertId;');
    const update: ModifyResults = {
      changedRows: val[0]['changedRows'],
      insertId: val[0]['insertId'],
      fieldCount: undefined,
      affectedRows: val[0]['changedRows'],
      info: undefined,
      serverStatus: undefined,
      warningStatus: undefined,
    };
    const res: RequestResults<ModifyResults> = {
      results: update,
      fields: null,
    };
    return res;
  }

  async query<S>(inQuery: string, inFields: Record<string, any>): Promise<RequestResults<S>> {
    // First, rename all the fields to add the prefix
    const fields: Record<string, any> = QueryUtil.addPrefixToFieldNames(inFields, ':');
    // Then, replace any null params
    let query: string = QueryUtil.replaceNullReplacementsInQuery(inQuery, fields);
    // Then, remove any unused params from the fields
    const slFields: Record<string, any> = QueryUtil.removeUnusedFields(query, fields);

    // If any of the fields are an array, do a direct replacement since sqlite don't like that
    Object.keys(slFields).forEach((k) => {
      const val: any = slFields[k];
      if (Array.isArray(val)) {
        const escaped: string = this.escape(val);
        query = query.replaceAll(k,  escaped );
        delete slFields[k]; // this prolly wont work
      }
    });

    // Finally, apply flags
    if ((this.flags || []).includes(SqliteConnectionConfigFlag.AlwaysCollateNoCase)) {
      query += ' COLLATE NOCASE';
    }

    const res: S[] = await this.conn.all<S>(query, slFields);

    const rval: RequestResults<S> = {
      results: res as S,
      fields: null,
    };
    return rval;
  }

  public async testConnection(logTestResults?: boolean): Promise<number | null> {
    if (logTestResults) {
      Logger.info('Running connection test');
    }

    const res: RequestResults<any> = await this.query('SELECT unixepoch()*1000 AS test', {});
    const rows = res.results as { test: number }[];
    const timestamp = rows.length === 1 ? rows[0].test : null;
    if (logTestResults) {
      Logger.info('Test returned : %j', timestamp);
    }
    return timestamp;
  }

  async rollbackTransaction(): Promise<void> {
    throw ErrorRatchet.fErr('Transactions not supported in Sqlite');
  }
}

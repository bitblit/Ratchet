import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import SqlString from 'sqlstring';
import { DatabaseAccess } from '../model/database-access.js';
import { DatabaseRequestType } from '../model/database-request-type.js';
import { ModifyResults } from '../model/modify-results.js';
import { RequestResults } from '../model/request-results.js';
import { QueryUtil } from '../query-builder/query-util.js';
import { SqliteConnectionConfigFlag } from './model/sqlite-connection-config-flag.js';
import { Database, RunResult, Statement } from 'better-sqlite3';
import { NumberRatchet } from '@bitblit/ratchet-common/lang/number-ratchet';
import { QueryAndParams } from './model/query-and-params';

export class SqliteDatabaseAccess implements DatabaseAccess {
  constructor(
    private conn: Database,
    private flags: SqliteConnectionConfigFlag[],
    private extraConfig: Record<string, any>,
  ) {}

  get connection(): Database {
    return this.conn;
  }

  beginTransaction(): Promise<void> {
    throw ErrorRatchet.fErr('Transactions not supported in Sqlite');
  }

  async close(): Promise<boolean> {
    try {
      this.conn.close();
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
    let rval: string = SqlString.escape(value);
    rval = rval.replaceAll("\\'", "''"); // For some reason sqlite uses '' as the escape for '...
    return rval;
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
    const qap: QueryAndParams = this.preprocessQuery({ query: query, params: fields });

    const stmt: Statement = this.conn.prepare(qap.query);
    const tmp: RunResult = stmt.run(qap.params);

    const update: ModifyResults = {
      changedRows: tmp.changes,
      insertId: NumberRatchet.safeNumber(tmp.lastInsertRowid),
      fieldCount: undefined,
      affectedRows: tmp.changes,
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

  preprocessQuery(qap: QueryAndParams): QueryAndParams {
    const rval: QueryAndParams = Object.assign(qap);

    // First, rename all the fields to add the prefix
    let tmp: Record<string, any> = QueryUtil.addPrefixToFieldNames(rval.params, ':');
    // Then, replace any null params
    rval.query = QueryUtil.replaceNullReplacementsInQuery(rval.query, tmp);
    // Then, remove any unused params from the fields
    rval.params = QueryUtil.removeUnusedFields(rval.query, rval.params, ':');
    tmp = QueryUtil.removeUnusedFields(rval.query, tmp); // And the prefixed version
    // CAW 2024-09-13 - This seems convoluted, can probably clean it a bit

    // If any of the fields are an array, do a direct replacement since sqlite don't like that
    Object.keys(tmp).forEach((k) => {
      const val: any = tmp[k];
      if (Array.isArray(val)) {
        const escaped: string = this.escape(val);
        rval.query = rval.query.replaceAll(k, escaped);
        delete rval.params[k.substring(1)]; // this prolly wont work
      }
    });

    // Finally, apply flags
    if ((this.flags || []).includes(SqliteConnectionConfigFlag.AlwaysCollateNoCase)) {
      rval.query += ' COLLATE NOCASE';
    }

    return rval;
  }

  async query<S>(inQuery: string, inFields: Record<string, any>): Promise<RequestResults<S>> {
    const qap: QueryAndParams = this.preprocessQuery({ query: inQuery, params: inFields });

    const stmt: Statement = this.conn.prepare(qap.query);
    const res: S[] = stmt.all(qap.params) as S[];

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

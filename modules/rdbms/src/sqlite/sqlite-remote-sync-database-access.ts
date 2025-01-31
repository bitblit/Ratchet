import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import SqlString from 'sqlstring';
import { SqliteDatabaseAccess } from './sqlite-database-access.js';
import { DatabaseAccess } from '../model/database-access.js';
import { DatabaseRequestType } from '../model/database-request-type.js';
import { RequestResults } from '../model/request-results.js';
import { ModifyResults } from '../model/modify-results.js';
import { SqliteRemoteFileSyncConfig } from './model/sqlite-remote-file-sync-config.js';
import { FlushRemoteMode } from './model/flush-remote-mode.js';
import { SqliteConnectionConfigFlag } from './model/sqlite-connection-config-flag.js';
import { FetchRemoteMode } from './model/fetch-remote-mode.js';
import DatabaseConstructor, { Database } from 'better-sqlite3';
import { RemoteStatusDataAndContent } from '@bitblit/ratchet-common/network/remote-file-tracker/remote-status-data-and-content';
import { RemoteFileTracker } from '@bitblit/ratchet-common/network/remote-file-tracker/remote-file-tracker';
import { RemoteStatusData } from '@bitblit/ratchet-common/network/remote-file-tracker/remote-status-data';

export class SqliteRemoteSyncDatabaseAccess implements DatabaseAccess {
  private cacheDb: Promise<SqliteDatabaseAccess>;

  constructor(
    private cfg: SqliteRemoteFileSyncConfig,
    private flags: SqliteConnectionConfigFlag[],
    private extraConfig: Record<string, any>,
  ) {
    this.cfg.flushRemoteMode = this.cfg.flushRemoteMode || FlushRemoteMode.Auto;
    this.cfg.fetchRemoteMode = this.cfg.fetchRemoteMode || FetchRemoteMode.EveryQuery;
  }

  private async db(): Promise<SqliteDatabaseAccess> {
    if (!this.cacheDb) {
      this.cacheDb = this.createDb();
    }
    return this.cacheDb;
  }

  public changeFlushRemoteMode(newMode: FlushRemoteMode): void {
    RequireRatchet.notNullOrUndefined(newMode, 'newMode');
    Logger.info('Changing flush remote mode from %s to %s', this.cfg.flushRemoteMode, newMode);
    this.cfg.flushRemoteMode = newMode;
  }

  public changeFetchRemoteMode(newMode: FetchRemoteMode): void {
    RequireRatchet.notNullOrUndefined(newMode, 'newMode');
    Logger.info('Changing fetch remote mode from %s to %s', this.cfg.fetchRemoteMode, newMode);
    this.cfg.fetchRemoteMode = newMode;
  }

  public async flushLocalToRemote(): Promise<void> {
    Logger.info('Flushing to remote (Flush mode is %s)', this.cfg.flushRemoteMode);
    const access: SqliteDatabaseAccess = await this.db();
    const asBuffer: Buffer = access.connection.serialize({});
    const result: RemoteStatusData<any> = await this.cfg.remoteFileTracker.pushUint8ArrayToRemote(asBuffer, { force: false, backup: true });
    Logger.info('Result is %j', result);
  }

  public async reloadRemoteToLocalIfNeeded(): Promise<SqliteDatabaseAccess> {
    Logger.info('Reloading remote to local (Fetch mode is %s)', this.cfg.fetchRemoteMode);
    const needed: boolean = await this.cfg.remoteFileTracker.modifiedSinceLastSync();
    if (needed) {
      Logger.info('Reloading, remote is newer');
      this.cacheDb = this.createDb(); // The old one is a memory db, just let it get garbage collected?
      await this.cacheDb; // We want to pause in this case
    } else {
      Logger.info('Skipping - remote is not modified');
    }
    return this.cacheDb;
  }

  private async createDb(): Promise<SqliteDatabaseAccess> {
    Logger.info('Pulling file local');
    const data: RemoteStatusDataAndContent<any> = await this.cfg.remoteFileTracker.pullRemoteData();
    Logger.info('Reading file as array');

    const uint: Uint8Array = await RemoteFileTracker.dataAsUint8Array(data);
    Logger.info('Converting to buffer (%d bytes)', uint.length);
    const asBuffer: Buffer = Buffer.from(uint);
    Logger.info('Got data %j %d', data.status, asBuffer.length);
    Logger.info('Creating database');
    const db: Database = new DatabaseConstructor(asBuffer);
    const rval: SqliteDatabaseAccess = new SqliteDatabaseAccess(db, this.flags, this.extraConfig);
    return rval;
  }

  beginTransaction(): Promise<void> {
    throw ErrorRatchet.fErr('Transactions not supported in Sqlite');
  }

  async close(): Promise<boolean> {
    try {
      const db: SqliteDatabaseAccess = await this.db();
      await db.close();
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
    return SqlString.format('?', value);
    //return StringRatchet.safeString(value);
  }

  async onRequestSuccessOnly(type: DatabaseRequestType): Promise<void> {
    if (type === DatabaseRequestType.Modify && this.cfg.flushRemoteMode === FlushRemoteMode.Auto) {
      Logger.info('Successful modification with auto mode - flushing remote');
      await this.flushLocalToRemote();
    }
  }

  /*
  async onRequestFailureOnly(type: DatabaseRequestType): Promise<void>{}

  async onRequestSuccessOrFailure(type: DatabaseRequestType): Promise<void> {
    return Promise.resolve(undefined);
  }


 */

  public async preQuery(): Promise<void> {
    if (this?.cfg?.fetchRemoteMode === FetchRemoteMode.EveryQuery) {
      Logger.debug('EveryQuery mode - checking remote');
      await this.reloadRemoteToLocalIfNeeded();
    }
  }

  async modify(query: string, fields: Record<string, any>): Promise<RequestResults<ModifyResults>> {
    const db: SqliteDatabaseAccess = await this.db();
    return db.modify(query, fields);
  }

  async query<S>(inQuery: string, inFields: Record<string, any>): Promise<RequestResults<S>> {
    const db: SqliteDatabaseAccess = await this.db();
    return db.query(inQuery, inFields);
  }

  public async testConnection(logTestResults?: boolean): Promise<number | null> {
    const db: SqliteDatabaseAccess = await this.db();
    return db.testConnection(logTestResults);
  }

  async rollbackTransaction(): Promise<void> {
    throw ErrorRatchet.fErr('Transactions not supported in Sqlite');
  }
}

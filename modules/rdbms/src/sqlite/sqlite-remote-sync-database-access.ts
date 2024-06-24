import { AsyncDatabase } from 'promised-sqlite3';
import { BackupResult, ErrorRatchet, FileTransferResult, Logger, RequireRatchet } from "@bitblit/ratchet-common";
import SqlString from 'sqlstring';
import { SqliteDatabaseAccess } from './sqlite-database-access.js';
import { DatabaseAccess } from "../model/database-access.js";
import { DatabaseRequestType } from "../model/database-request-type.js";
import { RequestResults } from "../model/request-results.js";
import { ModifyResults } from "../model/modify-results.js";
import { SqliteRemoteFileSyncConfig } from "./model/sqlite-remote-file-sync-config.js";
import { FlushRemoteMode } from "./model/flush-remote-mode.js";

export class SqliteRemoteSyncDatabaseAccess implements DatabaseAccess {
  private cacheDb: Promise<SqliteDatabaseAccess>;

  constructor(
    private cfg: SqliteRemoteFileSyncConfig,
    private extraConfig: Record<string, any>,
  ) {}

  private async db(): Promise<SqliteDatabaseAccess> {
    if (!this.cacheDb) {
      this.cacheDb = this.createDb();
    }
    return this.cacheDb;
  }

  public async backupRemoteNow(): Promise<BackupResult> {
    return this.cfg.remoteFileSync.backupRemote();
  }

  public changeFlushRemoteMode(newMode: FlushRemoteMode): void {
    RequireRatchet.notNullOrUndefined(newMode, 'newMode');
    this.cfg.flushRemoteMode = newMode;
  }

  public async flushToRemote(): Promise<void> {
    Logger.info('Flushing to remote');
    this.cacheDb = this.closeSyncReopen(this.db(), false);
  }

  public async reloadRemoteToLocal(): Promise<void> {
    Logger.info('Reloading remote to local');
    this.cacheDb = this.closeSyncReopen(this.db(), false);
  }

  private async closeSyncReopen(oldDbProm: Promise<SqliteDatabaseAccess>, remoteToLocal: boolean): Promise<SqliteDatabaseAccess> {
    const db: SqliteDatabaseAccess = await oldDbProm;
    Logger.info('Closing database for sync');
    await db.close();
    Logger.info('Remote sync : %s', remoteToLocal ? 'remoteToLocal' : 'localToRemote');
    const result: FileTransferResult = remoteToLocal
      ? await this.cfg.remoteFileSync.fetchRemoteToLocal()
      : await this.cfg.remoteFileSync.sendLocalToRemote();
    Logger.info('Returned %s - reopening', result);
    const newDb: AsyncDatabase = await AsyncDatabase.open(this.cfg.remoteFileSync.localFileName);
    const rval: SqliteDatabaseAccess = new SqliteDatabaseAccess(newDb, this.extraConfig);
    return rval;
  }

  private async createDb(): Promise<SqliteDatabaseAccess> {
    Logger.info('Pulling file local');
    await this.cfg.remoteFileSync.fetchRemoteToLocal();
    Logger.info('Creating database');
    const db: AsyncDatabase = await AsyncDatabase.open(this.cfg.remoteFileSync.localFileName);
    const rval: SqliteDatabaseAccess = new SqliteDatabaseAccess(db, this.extraConfig);
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
      await this.flushToRemote();
    }
  }

  /*
  async onRequestFailureOnly(type: DatabaseRequestType): Promise<void>{}

  async onRequestSuccessOrFailure(type: DatabaseRequestType): Promise<void> {
    return Promise.resolve(undefined);
  }

  async preQuery(): Promise<void> {
    return Promise.resolve(undefined);
  }

 */

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
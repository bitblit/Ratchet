import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import fs from "fs";
import { SqliteDatabaseAccess } from "./sqlite-database-access.js";
import { SqliteRemoteSyncDatabaseAccess } from "./sqlite-remote-sync-database-access.js";
import { DatabaseAccessProvider } from "../model/database-access-provider.js";
import { DatabaseAccess } from "../model/database-access.js";
import { DatabaseConfigList } from "../model/database-config-list.js";
import { SqliteConnectionConfig } from "./model/sqlite-connection-config.js";
import DatabaseConstructor, { Database } from "better-sqlite3";

/**
 */
export class SqliteStyleConnectionProvider implements DatabaseAccessProvider {
  private connectionCache: Map<string, Promise<DatabaseAccess>> = new Map<string, Promise<DatabaseAccess>>(); //// Cache the promises to make it a single connection
  private cacheConfigPromise: Promise<DatabaseConfigList<SqliteConnectionConfig>>;
  constructor(
    private configPromiseProvider: () => Promise<DatabaseConfigList<SqliteConnectionConfig>>,
    private additionalConfig: Record<string, any> = {},
  ) {
    this.cacheConfigPromise = this.createSqliteConnectionConfig(); // Sets up tunnels, etc
    Logger.info('Added shutdown handler to the process (Only once per instantiation)');
    this.addShutdownHandlerToProcess();
  }

  private addShutdownHandlerToProcess(): void {
    process.on('exit', () => {
      Logger.info('Process is shutting down, closing connections');
      this.clearDatabaseAccessCache().catch((err) => {
        Logger.error('Shutdown connection failed : %s', err);
      });
    });
  }

  public async clearDatabaseAccessCache(): Promise<boolean> {
    const rval = false;
    Logger.info('Clearing connection cache for SqliteStyleConnectionProvider');
    // First, clear the connection caches so that subsequent connection attempts start fresh
    const oldConnections: Promise<DatabaseAccess>[] = Array.from(this.connectionCache.values());
    //const oldDbHooks = this.dbPromise;
    //const oldSshTunnels = this.tunnels;
    this.cacheConfigPromise = null; // Re-read config in case the password expired, etc
    this.connectionCache = new Map();
    //this.tunnels = new Map();
    // Resolve any leftover DB connections & end them
    if (oldConnections.length > 0) {
      for (let i = 0; i < oldConnections.length; i++) {
        Logger.info('Shutting down old connection %d of %d', i, oldConnections.length);
        try {
          const conn: DatabaseAccess = await oldConnections[i];
          Logger.info('Conn %d', i);
          if (conn) {
            Logger.info('Stopping connection to database');
            try {
              await conn.close();
              Logger.info('Database connection closed');
            } catch (err) {
              if (ErrorRatchet.asErr(err).message.includes('closed state')) {
                // DB was already closed, ignore
              } else {
                Logger.error('Something went wrong closing the database connection : %s', err);
              }
            }
          }
        } catch (err) {
          Logger.warn('Shutdown failed : %s ', err, err);
        }
      }
    }
    Logger.info('Old db and tunnels removed');
    return rval;
  }

  public async getDatabaseAccess(name: string): Promise<DatabaseAccess | undefined> {
    Logger.silly('getConnectionAndTunnel : %s', name);
    if (!this.connectionCache.has(name)) {
      Logger.info('No connectionCache found for %s - creating new one', name);
      const dbConfig: SqliteConnectionConfig = await this.getDbConfig(name);
      const connection: Promise<DatabaseAccess> = this.createAsyncDatabase(dbConfig, this.additionalConfig, true);
      this.connectionCache.set(name, connection);
      Logger.info('Added connectionCache for %s', name);
    }
    return this.connectionCache.get(name);
  }

  private async getDbConfig(name: string): Promise<SqliteConnectionConfig> {
    Logger.info('SqliteStyleConnectionProvider:getDbConfig:Initiating promise for %s', name);
    const cfgs: DatabaseConfigList<SqliteConnectionConfig> = await this.configPromise();
    const finder: string = StringRatchet.trimToEmpty(name).toLowerCase();
    const dbConfig: SqliteConnectionConfig = cfgs.dbList.find((s) => StringRatchet.trimToEmpty(s.label).toLowerCase() === finder);
    if (!dbConfig) {
      throw ErrorRatchet.fErr(
        'Cannot find any connection config named %s (Available are %j)',
        name,
        cfgs.dbList.map((d) => d.label),
      );
    }
    return dbConfig;
  }

  // Always creates a promise
  private async createAsyncDatabase(
    dbCfg: SqliteConnectionConfig,
    _additionalConfig: Record<string, any> = {},
    clearCacheOnConnectionFailure: boolean,
  ): Promise<DatabaseAccess | undefined> {
    Logger.info('In SqliteStyleConnectionProvider:createAsyncDatabase : %s', dbCfg.label);
    RequireRatchet.notNullOrUndefined(dbCfg, 'dbCfg');

    Logger.debug('Opening connection for SqliteStyleConnectionProvider');
    let rval: DatabaseAccess;
    try {
      if (dbCfg.remoteFileSync) {
        rval = new SqliteRemoteSyncDatabaseAccess(dbCfg.remoteFileSync, dbCfg.flags, _additionalConfig);
      } else if (dbCfg.localFile) {
        if (!fs.existsSync(dbCfg.localFile.filePath)) {
          throw ErrorRatchet.fErr('Requested file does not exist : %s', dbCfg.localFile.filePath);
        }
        const db: Database = new DatabaseConstructor(dbCfg.localFile.filePath);
        rval = new SqliteDatabaseAccess(db, dbCfg.flags, _additionalConfig);
      } else {
        Logger.info('Neither remote nor local file specified, using memory');
        const db: Database = new DatabaseConstructor(':memory:');
        rval = new SqliteDatabaseAccess(db, dbCfg.flags, _additionalConfig);
      }
    } catch (err) {
      Logger.info('Failed trying to create connection : %s : clearing for retry', err);
      if (clearCacheOnConnectionFailure) {
        this.connectionCache = new Map<string, Promise<DatabaseAccess>>();
      }
      return undefined;
    }

    return rval;
  }

  private configPromise(): Promise<DatabaseConfigList<SqliteConnectionConfig>> {
    if (!this.cacheConfigPromise) {
      this.cacheConfigPromise = this.createSqliteConnectionConfig();
    }
    return this.cacheConfigPromise;
  }

  private async createSqliteConnectionConfig(): Promise<DatabaseConfigList<SqliteConnectionConfig>> {
    RequireRatchet.notNullOrUndefined(this.configPromiseProvider, 'input');
    const inputPromise: Promise<DatabaseConfigList<SqliteConnectionConfig>> = this.configPromiseProvider();
    Logger.info('Creating connection config');
    const cfg: DatabaseConfigList<SqliteConnectionConfig> = await inputPromise;
    RequireRatchet.true(cfg.dbList.length > 0, 'input.dbList');

    cfg.dbList.forEach((db) => {
      const errors: string[] = SqliteStyleConnectionProvider.validDbConfig(db);
      if (errors?.length) {
        throw ErrorRatchet.fErr('Errors found in db config : %j', errors);
      }
    });
    return cfg;
  }

  public static validDbConfig(cfg: SqliteConnectionConfig): string[] {
    let rval: string[] = [];
    if (!cfg) {
      rval.push('The config is null');
    } else {
      if (cfg.localFile && cfg.remoteFileSync) {
        rval.push('May not define both filePath and remoteFileSync');
      }
      if (cfg.localFile && !StringRatchet.trimToNull(cfg.localFile.filePath)) {
        rval.push('Localfile provided but filepath is not');
      }
      if (cfg.remoteFileSync && !cfg.remoteFileSync.remoteFileTracker) {
        rval.push('remoteFileTracker provided but remoteFileTracker value within is not');
      }
      rval.push(StringRatchet.trimToNull(cfg.label) ? null : 'label is required and non-empty');
    }
    rval = rval.filter((s) => !!s);
    return rval;
  }
}

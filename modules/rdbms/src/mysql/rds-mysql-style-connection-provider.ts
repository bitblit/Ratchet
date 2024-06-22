import maria, { Connection, ConnectionOptions } from "mysql2/promise";
import { ErrorRatchet, Logger, RequireRatchet, StringRatchet } from "@bitblit/ratchet-common";
import { SshTunnelService } from "../service/ssh-tunnel-service.js";
import { DatabaseConfigList } from "../model/database-config-list";
import getPort from "get-port";
import { SshTunnelContainer } from "../model/ssh/ssh-tunnel-container.js";
import { QueryDefaults } from "../model/query-defaults.js";
import { ConnectionAndTunnel } from "../model/connection-and-tunnel";
import { DatabaseAccessProvider } from "../model/database-access-provider";
import { DatabaseAccess } from "../model/database-access";
import { MysqlStyleDatabaseAccess } from "./mysql-style-database-access";
import { MysqlDbConfig } from "./model/mysql-db-config";

/**
 */
export class RdsMysqlStyleConnectionProvider implements DatabaseAccessProvider {
  // While this _technically_ expands the possible scope of Sql injection, we already
  // tightly limit to Named parameters, so multiple statements is more useful than not!
  public static DEFAULT_CONNECTION_OPTIONS: ConnectionOptions = { multipleStatements: true };

  private connectionCache = new Map<string, Promise<ConnectionAndTunnel<Connection, MysqlDbConfig>>>; //// Cache the promises to make it a single connection
  //private tunnels = new Map<string, SshTunnelContainer>();
  //private dbPromise = new Map<string, Promise<Connection | undefined>>(); // Cache the promises to make it a single connection
  private cacheConfigPromise: Promise<DatabaseConfigList<MysqlDbConfig>>;
  constructor(
    private configPromiseProvider: () => Promise<DatabaseConfigList<MysqlDbConfig>>,
    private additionalConfig: ConnectionOptions = RdsMysqlStyleConnectionProvider.DEFAULT_CONNECTION_OPTIONS,
    private ssh?: SshTunnelService
  ) {
    this.cacheConfigPromise = this.createConnectionConfig(); // Sets up tunnels, etc
    Logger.info('Added shutdown handler to the process (Only once per instantiation)');
    this.addShutdownHandlerToProcess();
  }

  public get usingSshTunnel(): boolean {
    return !!this.ssh;
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
    Logger.info('Clearing connection cache for RdsMysqlConnectionProvider');
    // First, clear the connection caches so that subsequent connection attempts start fresh
    const oldConnections: Promise<ConnectionAndTunnel<Connection, MysqlDbConfig>>[] = Array.from(this.connectionCache.values());
    //const oldDbHooks = this.dbPromise;
    //const oldSshTunnels = this.tunnels;
    this.cacheConfigPromise = null; // Re-read config in case the password expired, etc
    this.connectionCache = new Map();
    //this.tunnels = new Map();
    // Resolve any leftover DB connections & end them
    if (oldConnections.length > 0) {
      for (let i=0;i<oldConnections.length;i++) {
        Logger.info('Shutting down old connection %d of %d', i, oldConnections.length);
        try {
          const conn: ConnectionAndTunnel<Connection, MysqlDbConfig> = await oldConnections[i];
          Logger.info('Conn %d is %s', i, conn?.config?.label);
          if (conn.db) {
            Logger.info('Stopping connection to database');
            try {
              conn.db.destroy();
              Logger.info('Database connection closed');
            } catch (err) {
              if (ErrorRatchet.asErr(err).message.includes('closed state')) {
                // DB was already closed, ignore
              } else {
                Logger.error('Something went wrong closing the database connection : %s', err);
              }
            }
          }
          if (conn.ssh) {
            try {
              Logger.info('Stopping ssh tunnel');
              await this.ssh.shutdown(conn.ssh);
              Logger.info('Ssh tunnel stopped');
            } catch (err) {
              Logger.warn('Failed to stop ssh tunnel : %s',err,err);
            }
          }
        } catch (err) {
          Logger.warn('Shutdown failed : %s ',err,err);
        }
      }
    }
    Logger.info('Old db and tunnels removed');
    return rval;
  }

  public async getConnectionAndTunnel(name: string): Promise<ConnectionAndTunnel<Connection,MysqlDbConfig>> {
    Logger.silly('getConnectionAndTunnel : %s', name);
    if (!this.connectionCache.has(name)) {
      Logger.info('No connectionCache found for %s - creating new one', name);
      const dbConfig = await this.getDbConfig(name);
      const connection = this.createConnectionAndTunnel(dbConfig, this.additionalConfig, true);
      this.connectionCache.set(name, connection);
      Logger.info('Added connectionCache for %s', name);
    }
    return this.connectionCache.get(name);
  }

  public async getDatabaseAccess(name: string): Promise<DatabaseAccess | undefined> {
    Logger.silly('getConnection : %s', name);
    const conn: ConnectionAndTunnel<Connection,MysqlDbConfig> = await this.getConnectionAndTunnel(name);
    const rval: DatabaseAccess = conn?.db ? new MysqlStyleDatabaseAccess(conn.db, this.additionalConfig) : null;
    return rval;
  }


  public async createNonPooledConnectionAndTunnel( queryDefaults: QueryDefaults,
                                                   additionalConfig: ConnectionOptions = RdsMysqlStyleConnectionProvider.DEFAULT_CONNECTION_OPTIONS): Promise<ConnectionAndTunnel<Connection,MysqlDbConfig>> {
    Logger.info('Creating non-pooled connection for %s', queryDefaults.databaseName);
    const dbConfig = await this.getDbConfig(queryDefaults.databaseName);
    const rval = await this.createConnectionAndTunnel(dbConfig, additionalConfig, false);
    return rval;
  }


  public async createNonPooledDatabaseConnection(
    queryDefaults: QueryDefaults,
    additionalConfig: ConnectionOptions = RdsMysqlStyleConnectionProvider.DEFAULT_CONNECTION_OPTIONS
  ): Promise<Connection | undefined> {
    const conTunnel: ConnectionAndTunnel<Connection,MysqlDbConfig> = await this.createNonPooledConnectionAndTunnel(queryDefaults, additionalConfig);
    return conTunnel?.db;
  }

  private async getDbConfig(name: string): Promise<MysqlDbConfig> {
    Logger.info('RdsMysqlStyleConnectionProvider:getDbConfig:Initiating promise for %s', name);
    const cfgs: DatabaseConfigList<MysqlDbConfig> = await this.configPromise();
    const finder: string = StringRatchet.trimToEmpty(name).toLowerCase();
    const dbConfig = cfgs.dbList.find((s) => StringRatchet.trimToEmpty(s.label).toLowerCase() === finder);
    if (!dbConfig) {
      throw ErrorRatchet.fErr(
        'Cannot find any connection config named %s (Available are %j)',
        name,
        cfgs.dbList.map((d) => d.label)
      );
    }
    return dbConfig;
  }

  // Always creates a promise
  private async createConnectionAndTunnel(
    dbCfg: MysqlDbConfig,
    additionalConfig: ConnectionOptions = RdsMysqlStyleConnectionProvider.DEFAULT_CONNECTION_OPTIONS,
    clearCacheOnConnectionFailure: boolean
  ): Promise<ConnectionAndTunnel<Connection,MysqlDbConfig> | undefined> {
    Logger.info('In RdsMysqlStyleConnectionProvider:createConnectionAndTunnel : %s', dbCfg.label);
    RequireRatchet.notNullOrUndefined(dbCfg, 'dbCfg');

    let tunnel: SshTunnelContainer = null;
    if (dbCfg.sshTunnelConfig) {
      const localPort: number = dbCfg.sshTunnelConfig.forceLocalPort || await getPort();
      Logger.debug('SSH tunnel config found, opening tunnel to %s / %s to using local port %s', dbCfg.sshTunnelConfig.host, dbCfg.sshTunnelConfig.port, localPort);
      tunnel = await this.ssh.createSSHTunnel(dbCfg.sshTunnelConfig, dbCfg.host, dbCfg.port, localPort);
      Logger.debug('SSH Tunnel open');
    } else {
      Logger.debug('No ssh configuration - skipping tunnel');
    }

    Logger.debug('Opening connection for RdsMysqlStyleConnectionProvider');
    let connection: Connection;
    try {
      const cfgCopy: MysqlDbConfig = structuredClone(dbCfg);
      delete cfgCopy.label;
      delete cfgCopy.sshTunnelConfig;
      if (tunnel) {
        cfgCopy.host = 'localhost';
        cfgCopy.port = tunnel.localPort;
      }

      connection = await maria.createConnection({ ...additionalConfig, ...cfgCopy });
    } catch (err) {
      Logger.info('Failed trying to create connection : %s : clearing for retry', err);
      if (clearCacheOnConnectionFailure) {
        this.connectionCache = new Map<string, Promise<ConnectionAndTunnel<Connection,MysqlDbConfig>>>();
      }
      return undefined;
    }
    connection.on('error', (err) => {
      Logger.info('An error was detected on the connection : %s : Clearing', err);
      this.clearDatabaseAccessCache()
        .then((cleared) => {
          Logger.info('Connection cleared: %s', cleared);
        })
        .catch((err) => Logger.error('Failed to clear RDS connection cache: %j', err));
    });
    Logger.info(
      'Added error handler to db, there are now %d error handlers and %d shutdown handlers',
      connection.rawListeners('error').length,
      process.rawListeners('exit').length
    );

    const rval: ConnectionAndTunnel<Connection,MysqlDbConfig> = {
      config: dbCfg,
      db: connection,
      ssh: tunnel
    };

    return rval;
  }

  private configPromise(): Promise<DatabaseConfigList<MysqlDbConfig>> {
    if (!this.cacheConfigPromise) {
      this.cacheConfigPromise = this.createConnectionConfig();
    }
    return this.cacheConfigPromise;
  }

  private async createConnectionConfig(): Promise<DatabaseConfigList<MysqlDbConfig>> {
    RequireRatchet.notNullOrUndefined(this.configPromiseProvider, 'input');
    const inputPromise: Promise<DatabaseConfigList<MysqlDbConfig>> = this.configPromiseProvider();
    Logger.info('Creating connection config');
    const cfg: DatabaseConfigList<MysqlDbConfig> = await inputPromise;
    RequireRatchet.true(cfg.dbList.length > 0, 'input.dbList');

    cfg.dbList.forEach(db=>{
      const errors: string[] = RdsMysqlStyleConnectionProvider.validDbConfig(db);
      if (errors?.length) {
        throw ErrorRatchet.fErr('Errors found in db config : %j', errors);
      }
    });
    return cfg;
  }

  public static validDbConfig(cfg: MysqlDbConfig): string[] {
    let rval: string[] = [];
    if (!cfg) {
      rval.push('The config is null');
    } else {
      rval.push(StringRatchet.trimToNull(cfg.host) ? null : 'host is required and non-empty');
      rval.push(StringRatchet.trimToNull(cfg.label) ? null : 'label is required and non-empty');
      rval.push(StringRatchet.trimToNull(cfg.database) ? null : 'database is required and non-empty');
      rval.push(StringRatchet.trimToNull(cfg.user) ? null : 'user is required and non-empty');
      rval.push(StringRatchet.trimToNull(cfg.password) ? null : 'password is required and non-empty');
      rval.push(cfg.port ? null : 'port is required and non-empty');
    }
    if (cfg.sshTunnelConfig) {
      rval.push(StringRatchet.trimToNull(cfg.sshTunnelConfig.host) ? null : 'If sshTunnelConfig is non-null, host is required and non-empty');
      rval.push(cfg.sshTunnelConfig.port ? null : 'If sshTunnelConfig is non-null, port is required and non-empty');
    }
    rval = rval.filter(s=>!!s);
    return rval;
  }
}

import maria, { Connection, ConnectionOptions } from 'mysql2/promise';
import { ErrorRatchet, Logger, RequireRatchet } from '@bitblit/ratchet-common';
import { SshTunnelService } from './ssh-tunnel-service.js';
import { MysqlStyleConnectionProvider } from './model/mysql/mysql-style-connection-provider.js';
import { ConnectionConfig } from './model/connection-config.js';
import getPort from 'get-port';
import _ from 'lodash';
import { SshTunnelContainer } from './model/ssh/ssh-tunnel-container.js';
import { DbConfig } from './model/db-config.js';
import { SshTunnelConfig } from './model/ssh/ssh-tunnel-config.js';
import { QueryDefaults } from './model/query-defaults.js';

/**
 */
export class RdsMysqlStyleConnectionProvider implements MysqlStyleConnectionProvider {
  // While this _technically_ expands the possible scope of Sql injection, we already
  // tightly limit to Named parameters, so multiple statements is more useful than not!
  public static DEFAULT_CONNECTION_OPTIONS: ConnectionOptions = { multipleStatements: true };

  private tunnels = new Map<string, SshTunnelContainer>();
  private dbPromise = new Map<string, Promise<Connection | undefined>>(); // Cache the promises to make it a single connection
  private readonly configPromise: Promise<ConnectionConfig>;
  constructor(
    private inConfigPromise: Promise<ConnectionConfig>,
    private additionalConfig: ConnectionOptions = RdsMysqlStyleConnectionProvider.DEFAULT_CONNECTION_OPTIONS,
    private ssh?: SshTunnelService
  ) {
    this.configPromise = this.prepareConnectionConfig(inConfigPromise); // Sets up tunnels, etc
    Logger.info('Added shutdown handler to the process (Only once per instantiation)');
    this.addShutdownHandlerToProcess();
  }

  public get usingSshTunnel(): boolean {
    return !!this.ssh;
  }

  private addShutdownHandlerToProcess(): void {
    process.on('exit', () => {
      Logger.info('Process is shutting down, closing connections');
      this.clearConnectionCache().catch((err) => {
        Logger.error('Shutdown connection failed : %s', err);
      });
    });
  }

  public async clearConnectionCache(): Promise<boolean> {
    const rval = false;
    Logger.info('Clearing connection cache for RdsMysqlConnectionProvider');
    // First, clear the connection caches so that subsequent connection attempts start fresh
    const oldDbHooks = this.dbPromise;
    const oldSshTunnels = this.tunnels;
    this.dbPromise = new Map();
    this.tunnels = new Map();
    // Resolve any leftover DB connections & end them
    if (oldDbHooks.size > 0) {
      const hookNames: string[] = Array.from(oldDbHooks.keys());
      for (const hookName of hookNames) {
        Logger.info('Shutting down connection : %s', hookName);
        const oldDbHook = oldDbHooks.get(hookName);
        try {
          const oldConn = await oldDbHook;
          if (oldConn) {
            await oldConn.destroy();
            Logger.info('Finished destroying old connection');
          } else {
            Logger.warn('Could not get old connection, so not destroying it');
          }
        } catch (err) {
          if (ErrorRatchet.asErr(err).message.includes('closed state')) {
            // DB was already closed, ignore
          } else {
            Logger.error('Something went wrong closing the connection : %s', err);
            throw err; // Rethrow it...
          }
        }
      }
    }
    // End any remaining SSH tunnels
    if (oldSshTunnels.size > 0) {
      const tunnelNames = Array.from(oldSshTunnels.keys());
      for (const tunnelName of tunnelNames) {
        try {
          Logger.info('Shutting down SSH tunnel: %s', tunnelName);
          const tunnel = oldSshTunnels.get(tunnelName);
          if (tunnel) {
            await this.ssh.shutdown(tunnel);
          } else {
            Logger.warn('Could not get old tunnel, so not destroying it');
          }
          Logger.info('SSH Tunnel closed');
        } catch (err) {
          // Nothing else to be done but log it...
          Logger.error('Failure closing old tunnel : %s', err);
        }
      }
    }
    Logger.info('Old db and tunnel removed');
    return rval;
  }

  public async getConnection(name: string): Promise<Connection | undefined> {
    if (!this.dbPromise.has(name)) {
      const dbConfig = await this.getDbConfig(name);
      const connection = this.createDatabaseConnection(dbConfig, this.additionalConfig, true);
      this.dbPromise.set(name, connection);
    }
    return this.dbPromise.get(name);
  }

  public async createNonPooledDatabaseConnection(
    queryDefaults: QueryDefaults,
    additionalConfig: ConnectionOptions = RdsMysqlStyleConnectionProvider.DEFAULT_CONNECTION_OPTIONS
  ): Promise<Connection | undefined> {
    Logger.info('Creating non-pooled connection for %s', queryDefaults.databaseName);
    const dbConfig = await this.getDbConfig(queryDefaults.databaseName);
    const rval = await this.createDatabaseConnection(dbConfig, additionalConfig, false);
    return rval;
  }

  private async getDbConfig(name: string): Promise<DbConfig> {
    Logger.info('RdsMysqlStyleConnectionProvider:getDbConfig:Initiating promise for %s', name);
    const cfgs: ConnectionConfig = await this.configPromise;
    const dbConfig = cfgs.dbList.find((s) => s.label === name.toLowerCase());
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
  private async createDatabaseConnection(
    dbCfg: DbConfig,
    additionalConfig: ConnectionOptions = RdsMysqlStyleConnectionProvider.DEFAULT_CONNECTION_OPTIONS,
    clearCacheOnConnectionFailure: boolean,
    sshConfigPromise?: Promise<SshTunnelConfig>
  ): Promise<Connection | undefined> {
    Logger.debug('In RdsMysqlStyleConnectionProvider:createDatabaseConnection : %s', dbCfg.label);

    const cfgCopy = _.omit(_.clone(dbCfg), 'label', 'tunnelPort');
    // Verify the tunnel
    if (this.usingSshTunnel && dbCfg.tunnelPort) {
      let tunnel = this.tunnels.get(dbCfg.label);
      if (!tunnel) {
        Logger.debug('Creating SSH tunnel from local port %d to remote host %s and port %d', dbCfg.tunnelPort, dbCfg.host, dbCfg.port);
        const sshConfig: SshTunnelConfig = await sshConfigPromise;
        tunnel = await this.ssh.createSSHTunnel(sshConfig, dbCfg.host, dbCfg.port, dbCfg.tunnelPort);
        this.tunnels.set(dbCfg.label, tunnel);
      }
      cfgCopy.port = tunnel.serverOptions.port ?? -1;
      cfgCopy.host = 'localhost';
    }

    Logger.debug('Opening connection for RdsMysqlStyleConnectionProvider');
    let connection: Connection;
    try {
      connection = await maria.createConnection({ ...additionalConfig, ...cfgCopy });
    } catch (err) {
      Logger.info('Failed trying to create connection : %s : clearing for retry', err);
      if (clearCacheOnConnectionFailure) {
        this.dbPromise = new Map<string, Promise<Connection>>();
      }
      return undefined;
    }
    connection.on('error', (err) => {
      Logger.info('An error was detected on the connection : %s : Clearing', err);
      this.clearConnectionCache()
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
    return connection;
  }

  private async prepareConnectionConfig(inputPromise: Promise<ConnectionConfig>): Promise<ConnectionConfig> {
    RequireRatchet.notNullOrUndefined(inputPromise, 'input');
    const cfg: ConnectionConfig = await inputPromise;
    RequireRatchet.true(cfg.dbList.length > 0, 'input.dbList');

    if (this.usingSshTunnel) {
      for (const dbConfig of cfg.dbList) {
        dbConfig.tunnelPort = await getPort();
      }
    }
    return cfg;
  }
}

import { Connection } from 'mysql2/promise';
import { MysqlStyleConnectionProvider } from './model/mysql/mysql-style-connection-provider.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lib/lang/require-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';

export class NonPooledMysqlStyleConnectionProvider implements MysqlStyleConnectionProvider {
  constructor(private connection: Connection) {
    RequireRatchet.notNullOrUndefined(connection);
  }
  public async getConnection(): Promise<Connection> {
    return this.connection;
  }
  public async clearConnectionCache(): Promise<boolean> {
    Logger.info('clearConnectionCache ignored - not pooled');
    return true;
  }
}

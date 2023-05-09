import { Connection, ConnectionOptions } from 'mysql2/promise';
import { QueryDefaults } from '../query-defaults.js';

export interface MysqlStyleConnectionProvider {
  /**
   * @param name if omitted, returns the default connection
   */
  getConnection(name?: string): Promise<Connection | undefined>;
  clearConnectionCache(): Promise<boolean>;
  createNonPooledDatabaseConnection?(queryDefaults: QueryDefaults, additionalConfig?: ConnectionOptions): Promise<Connection | undefined>;
}

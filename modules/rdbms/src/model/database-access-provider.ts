import { DatabaseAccess } from './database-access.js';
import { QueryDefaults } from './query-defaults.js';

export interface DatabaseAccessProvider {
  /**
   * @param name if omitted, returns the default connection
   */
  getDatabaseAccess(name?: string): Promise<DatabaseAccess | undefined>;
  clearDatabaseAccessCache(): Promise<boolean>;
  createNonPooledDatabaseAccess?(queryDefaults: QueryDefaults, additionalConfig?: Record<string, any>): Promise<DatabaseAccess | undefined>;
}

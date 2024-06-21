import { DatabaseAccess } from "./database-access";
import { QueryDefaults } from "./query-defaults";

export interface DatabaseAccessProvider<T,R> {
  /**
   * @param name if omitted, returns the default connection
   */
  getDatabaseAccess(name?: string): Promise<DatabaseAccess<T,R> | undefined>;
  clearDatabaseAccessCache(): Promise<boolean>;
  createNonPooledDatabaseAccess?(queryDefaults: QueryDefaults, additionalConfig?: R): Promise<DatabaseAccess<T,R> | undefined>;
}

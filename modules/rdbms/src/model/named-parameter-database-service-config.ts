import { QueryTextProvider } from "./query-text-provider";
import { DatabaseAccessProvider } from "./database-access-provider";
import { QueryDefaults } from "./query-defaults";

export interface NamedParameterDatabaseServiceConfig {
  serviceName: string;
  queryProvider: QueryTextProvider;
  connectionProvider: DatabaseAccessProvider;
  queryDefaults: QueryDefaults;
  longQueryTimeMs: number;
}
import { QueryTextProvider } from './query-text-provider.js';
import { DatabaseAccessProvider } from './database-access-provider.js';
import { QueryDefaults } from './query-defaults.js';
import { LoggerInstance } from '@bitblit/ratchet-common/logger/logger-instance';

export interface NamedParameterDatabaseServiceConfig {
  serviceName: string;
  queryProvider: QueryTextProvider;
  connectionProvider: DatabaseAccessProvider;
  queryDefaults: QueryDefaults;
  longQueryTimeMs: number;
  logger?: LoggerInstance;
}

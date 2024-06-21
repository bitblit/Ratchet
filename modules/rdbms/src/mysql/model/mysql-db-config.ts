import { DbConfig } from '../../model/db-config.js';

export interface MysqlDbConfig extends DbConfig {
  ssl?: string | Record<string, any>;
  decimalNumbers?: boolean;
}

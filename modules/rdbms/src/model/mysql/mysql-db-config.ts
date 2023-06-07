import { DbConfig } from '../db-config.js';

export interface MysqlDbConfig extends DbConfig {
  ssl?: string;
  decimalNumbers?: boolean;
}

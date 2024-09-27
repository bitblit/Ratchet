import { LoggerOptions } from './logger-options.js';

export interface LoggerMeta {
  options: LoggerOptions;
  loggerInstanceName: string;
  loggerInstanceId: string;
}

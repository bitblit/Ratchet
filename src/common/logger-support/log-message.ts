import { LoggerLevelName } from './logger-level-name.js';

export interface LogMessage {
  lvl: LoggerLevelName;
  timestamp: number;
  messageSource: string;
  subsVars?: any[];
  params?: Record<string, string | number | boolean>;
}

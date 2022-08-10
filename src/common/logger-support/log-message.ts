import { LoggerLevelName } from './logger-level-name';

export interface LogMessage {
  lvl: LoggerLevelName;
  timestamp: number;
  messageSource: string;
  subsVars?: any[];
  params?: Record<string, string>;
}

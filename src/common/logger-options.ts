import { LoggerLevelName } from './logger';

export interface LoggerOptions {
  initialLevel: LoggerLevelName;
  levelColors: string[];
}

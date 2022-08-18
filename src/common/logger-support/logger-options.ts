import { LogMessageFormatType } from './log-message-format-type';
import { LoggerLevelName } from './logger-level-name';
import { LogMessageProcessor } from './log-message-processor';
import { LoggerOutputFunction } from './logger-output-function';

export interface LoggerOptions {
  initialLevel?: LoggerLevelName;
  formatType?: LogMessageFormatType;
  trace?: string;
  globalVars?: Record<string, string | number | boolean>;
  outputFunction?: LoggerOutputFunction;
  ringBufferSize?: number;
  preProcessors?: LogMessageProcessor[];
}

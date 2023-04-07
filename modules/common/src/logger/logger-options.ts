import { LogMessageFormatType } from './log-message-format-type.js';
import { LoggerLevelName } from './logger-level-name.js';
import { LogMessageProcessor } from './log-message-processor.js';
import { LoggerOutputFunction } from './logger-output-function.js';

export interface LoggerOptions {
  initialLevel?: LoggerLevelName;
  formatType?: LogMessageFormatType;
  trace?: string;
  globalVars?: Record<string, string | number | boolean>;
  outputFunction?: LoggerOutputFunction;
  ringBufferSize?: number;
  preProcessors?: LogMessageProcessor[];
}

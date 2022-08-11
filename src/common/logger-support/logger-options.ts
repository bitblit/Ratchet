import { LogMessageFormatType } from './log-message-format-type';
import { LoggerLevelName } from './logger-level-name';
import { LogMessageProcessor } from './log-message-processor';

export interface LoggerOptions {
  initialLevel?: LoggerLevelName;
  formatType?: LogMessageFormatType;
  trace?: string;
  globalVars?: Record<string, string | number | boolean>;
  doNotUseConsoleDebug?: boolean;
  ringBufferSize?: number;
  preProcessors?: LogMessageProcessor[];
}

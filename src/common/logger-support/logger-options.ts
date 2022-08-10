import { LogMessageFormatType } from './log-message-format-type';
import { LoggerLevelName } from './logger-level-name';

export interface LoggerOptions {
  initialLevel?: LoggerLevelName;
  formatType?: LogMessageFormatType;
  trace?: string;
  globalVars?: Record<string, string>;
  doNotUseConsoleDebug?: boolean;
  ringBufferSize?: number;
}

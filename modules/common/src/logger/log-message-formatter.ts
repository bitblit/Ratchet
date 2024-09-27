import { LogMessage } from './log-message.js';
import { LoggerMeta } from './logger-meta.js';

export interface LogMessageFormatter {
  formatMessage(msg: LogMessage, meta: LoggerMeta): string;
}

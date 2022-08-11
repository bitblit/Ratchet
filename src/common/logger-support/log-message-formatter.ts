import { LogMessage } from './log-message';
import { LoggerMeta } from './logger-meta';

export interface LogMessageFormatter {
  formatMessage(msg: LogMessage, meta: LoggerMeta): string;
}

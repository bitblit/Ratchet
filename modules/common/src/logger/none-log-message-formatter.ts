import { LogMessage } from './log-message.js';
import { LogMessageFormatter } from './log-message-formatter.js';
import { LoggerMeta } from './logger-meta.js';

// No-op, useful for testing and turning off all logging
export class NoneLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(_msg: LogMessage, _meta: LoggerMeta): string {
    return null;
  }
}

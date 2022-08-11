import { LogMessage } from './log-message';
import { LogMessageFormatter } from './log-message-formatter';
import { LoggerMeta } from './logger-meta';

// No-op, useful for testing and turning off all logging
export class NoneLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, meta: LoggerMeta): string {
    return null;
  }
}

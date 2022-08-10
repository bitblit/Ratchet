import { LogMessage } from './log-message';
import { LogMessageFormatter } from './log-message-formatter';

// No-op, useful for testing and turning off all logging
export class NoneLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, globalVars: Record<string, string>, tracePrefix: string): string {
    return null;
  }
}

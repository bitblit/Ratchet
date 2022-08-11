import { LogMessage } from './log-message';

export interface LogMessageProcessor {
  process(msg: LogMessage): LogMessage;
}

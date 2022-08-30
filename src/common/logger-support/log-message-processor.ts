import { LogMessage } from './log-message.js';

export interface LogMessageProcessor {
  process(msg: LogMessage): LogMessage;
}

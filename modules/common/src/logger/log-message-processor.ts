import { LogMessage } from './log-message.js';

export interface LogMessageProcessor {
  label?(): string;
  process(msg: LogMessage): LogMessage;
}

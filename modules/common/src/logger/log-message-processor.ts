import { LogMessage } from './log-message';

export interface LogMessageProcessor {
  label?(): string;
  process(msg: LogMessage): LogMessage;
}

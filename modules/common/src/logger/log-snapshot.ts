import { LogMessage } from './log-message';

export interface LogSnapshot {
  logMessagesTruncated: number;
  messages: LogMessage[];
}

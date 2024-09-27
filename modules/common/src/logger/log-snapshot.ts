import { LogMessage } from './log-message.js';

export interface LogSnapshot {
  logMessagesTruncated: number;
  messages: LogMessage[];
}

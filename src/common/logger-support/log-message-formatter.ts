import { LogMessage } from './log-message';

export interface LogMessageFormatter {
  formatMessage(msg: LogMessage, globalVars: Record<string, string>, tracePrefix: string): string;
}

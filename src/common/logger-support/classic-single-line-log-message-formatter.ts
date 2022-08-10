import util from 'util';
import { LogMessage } from './log-message';
import { LogMessageFormatter } from './log-message-formatter';

export class ClassicSingleLineLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, globalVars: Record<string, string>, tracePrefix: string): string {
    let tmp: string = null;

    if (msg) {
      tmp = '';
      tmp += tracePrefix ? tracePrefix + ' ' : '';

      tmp += '[' + msg.lvl + '] ';
      tmp += util.format(msg.messageSource, ...msg.subsVars);
    }
    return tmp;
  }
}

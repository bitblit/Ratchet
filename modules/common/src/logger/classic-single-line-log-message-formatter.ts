import util from 'util';
import { LogMessage } from './log-message.js';
import { LogMessageFormatter } from './log-message-formatter.js';
import { LoggerMeta } from './logger-meta.js';

export class ClassicSingleLineLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, meta: LoggerMeta): string {
    let tmp: string = null;

    if (msg) {
      tmp = '';
      tmp += meta.options.trace ? meta.options.trace + ' ' : '';

      tmp += '[' + msg.lvl + '] ';
      tmp += util.format(msg.messageSource, ...msg.subsVars);
    }
    return tmp;
  }
}
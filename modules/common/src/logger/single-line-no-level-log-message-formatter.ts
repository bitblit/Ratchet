import { LogMessage } from './log-message.js';
import { LogMessageFormatter } from './log-message-formatter.js';
import { LoggerMeta } from './logger-meta.js';
import { StringRatchet } from '../lang/string-ratchet.js';

// Used when the output will be put into a table with the other fields separate
export class SingleLineNoLevelLogMessageFormatter implements LogMessageFormatter {

  public formatMessage(msg: LogMessage, meta: LoggerMeta): string {
    let tmp: string = null;

    if (msg) {
      tmp = '';
      tmp += meta?.options?.trace ? meta.options.trace + ' ' : '';
      tmp += StringRatchet.format(msg?.messageSource ?? '', ...(msg.subsVars || []));
    }
    return tmp;
  }
}

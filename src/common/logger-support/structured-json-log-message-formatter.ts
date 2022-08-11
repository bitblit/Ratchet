import util from 'util';
import { LogMessage } from './log-message';
import { LogMessageFormatter } from './log-message-formatter';

export class StructuredJsonLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, globalVars: Record<string, string | number | boolean>, tracePrefix: string): string {
    let rval: string = null;
    if (msg) {
      const tmp: Record<any, any> = Object.assign({}, globalVars || {}, msg.params || {});
      tmp['message'] = util.format(msg.messageSource, ...msg.subsVars);
      tmp['epochMS'] = msg.timestamp;
      tmp['timestamp'] = new Date(msg.timestamp).toISOString();
      tmp['level'] = msg.lvl;
      if (tracePrefix) {
        tmp['trace'] = tracePrefix;
      }

      rval = JSON.stringify(tmp);
    }
    return rval;
  }
}

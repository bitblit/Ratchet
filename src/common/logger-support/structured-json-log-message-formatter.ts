import util from 'util';
import { LogMessage } from './log-message';
import { LogMessageFormatter } from './log-message-formatter';
import { LoggerMeta } from './logger-meta';

export class StructuredJsonLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, meta: LoggerMeta): string {
    let rval: string = null;
    if (msg) {
      const tmp: Record<any, any> = Object.assign({}, meta.options.globalVars || {}, msg.params || {});
      tmp['message'] = util.format(msg.messageSource, ...msg.subsVars);
      tmp['epochMS'] = msg.timestamp;
      tmp['timestamp'] = new Date(msg.timestamp).toISOString();
      tmp['level'] = msg.lvl;
      if (meta.options.trace) {
        tmp['trace'] = meta.options.trace;
      }
      tmp['logName'] = meta.loggerInstanceName;
      tmp['logId'] = meta.loggerInstanceId;

      rval = JSON.stringify(tmp);
    }
    return rval;
  }
}

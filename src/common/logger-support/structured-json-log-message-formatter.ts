import util from 'util';
import { LogMessage } from './log-message';
import { LogMessageFormatter } from './log-message-formatter';
import { LoggerMeta } from './logger-meta';

export class StructuredJsonLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, meta: LoggerMeta): string {
    let rval: string = null;
    if (msg) {
      const tmp: Record<any, any> = Object.assign({}, meta.options.globalVars || {}, msg.params || {});
      tmp['msg'] = util.format(msg.messageSource, ...msg.subsVars);
      tmp['utcDateTime'] = new Date(msg.timestamp).toISOString();
      tmp['logLevel'] = msg.lvl;
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

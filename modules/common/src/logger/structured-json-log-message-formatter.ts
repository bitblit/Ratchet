import { LogMessage } from './log-message.js';
import { LogMessageFormatter } from './log-message-formatter.js';
import { LoggerMeta } from './logger-meta.js';
import { StringRatchet } from "../lang/string-ratchet.js";

export class StructuredJsonLogMessageFormatter implements LogMessageFormatter {
  public formatMessage(msg: LogMessage, meta: LoggerMeta): string {
    let rval: string = null;
    if (msg) {
      const tmp: Record<any, any> = Object.assign({}, meta.options.globalVars || {}, msg.params || {});
      tmp['msg'] = StringRatchet.format(msg.messageSource, ...msg.subsVars);
      tmp['utcDateTime'] = new Date(msg.timestamp).toISOString();
      tmp['logLevel'] = msg.lvl;
      if (meta.options.trace) {
        tmp['trace'] = meta.options.trace;
      }
      tmp['logName'] = meta.loggerInstanceName;
      tmp['logId'] = meta.loggerInstanceId;

      rval = JSON.stringify(tmp) + '\n'; // You must have this newline at the end if using stdout instead of console.log
      // see https://stackoverflow.com/questions/4976466/difference-between-process-stdout-write-and-console-log-in-node-js
    }
    return rval;
  }
}

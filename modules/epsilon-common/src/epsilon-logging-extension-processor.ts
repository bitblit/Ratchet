import { LogMessageProcessor } from '@bitblit/ratchet-common/logger/log-message-processor';
import { LogMessage } from '@bitblit/ratchet-common/logger/log-message';
import { ContextUtil } from './util/context-util.js';

export class EpsilonLoggingExtensionProcessor implements LogMessageProcessor {
  public process(msg: LogMessage): LogMessage {
    msg.params = Object.assign({}, msg.params || {}, ContextUtil.fetchLogVariables());
    msg.params['tester'] = Date.now();
    msg.params['awsRequestId'] = ContextUtil.currentRequestId();
    //msg.params['epoch'] = msg.timestamp;
    msg.params['traceId'] = ContextUtil.currentTraceId();
    msg.params['traceDepth'] = ContextUtil.currentTraceDepth();
    msg.params['procLabel'] = ContextUtil.currentProcessLabel();
    return msg;
  }
  public label(): string {
    return 'EpsilonLoggingExtensionProcessor';
  }
}

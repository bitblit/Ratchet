import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { BackgroundProcessor } from '../../config/background/background-processor.js';
import { EchoProcessor } from './echo-processor.js';
import { BackgroundManagerLike } from '../../background/manager/background-manager-like.js';

export class LogAndEnqueueEchoProcessor implements BackgroundProcessor<any> {
  public readonly typeName: string = 'EpsilonLogAndEnqueueEcho';

  public async handleEvent(data: any, cfg: BackgroundManagerLike): Promise<void> {
    Logger.info('LogAndEnqueueEchoProcessor : %j', data);
    await cfg.fireImmediateProcessRequestByParts(EchoProcessor.ECHO_PROCESSOR_TYPE_NAME, { upstream: data });
    Logger.info('Completed : LogAndEnqueueEchoProcessor');
  }
}

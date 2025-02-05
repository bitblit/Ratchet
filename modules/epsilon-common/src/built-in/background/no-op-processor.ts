import { BackgroundProcessor } from '../../config/background/background-processor.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { BackgroundManagerLike } from '../../background/manager/background-manager-like.js';

export class NoOpProcessor implements BackgroundProcessor<any> {
  public readonly typeName: string = 'EpsilonNoOp';

  public async handleEvent(_data: any, _mgr?: BackgroundManagerLike): Promise<void> {
    // Does nothing
    Logger.silly('Hit the no-op proc');
  }
}

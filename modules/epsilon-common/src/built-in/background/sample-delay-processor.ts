import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { BackgroundProcessor } from '../../config/background/background-processor.js';
import { BackgroundManagerLike } from '../../background/manager/background-manager-like.js';

export class SampleDelayProcessor implements BackgroundProcessor<any> {
  public get typeName(): string {
    return 'EpsilonSampleDelay';
  }

  public async handleEvent(_data: any, _mgr?: BackgroundManagerLike): Promise<void> {
    const delayMS: number = Math.floor(Math.random() * 5000);
    Logger.info('Running sample processor for %d', delayMS);
    await PromiseRatchet.wait(delayMS);
    Logger.info('Sample processor complete');
  }
}

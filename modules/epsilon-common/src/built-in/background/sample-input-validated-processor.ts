import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { BackgroundProcessor } from '../../config/background/background-processor.js';
import { SampleInputValidatedProcessorData } from './sample-input-validated-processor-data.js';
import { BackgroundManagerLike } from '../../background/manager/background-manager-like.js';

export class SampleInputValidatedProcessor implements BackgroundProcessor<SampleInputValidatedProcessorData> {
  public readonly typeName: string = 'EpsilonSampleInputValidated';

  public async handleEvent(data: SampleInputValidatedProcessorData, _mgr?: BackgroundManagerLike): Promise<void> {
    Logger.info('Running SampleInputValidatedProcessor, data was : %j', data);
  }

  public readonly dataSchemaName: string = 'BackgroundSampleInputValidatedProcessorData';
}

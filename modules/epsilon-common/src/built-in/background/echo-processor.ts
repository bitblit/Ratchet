import { ErrorRatchet } from '@bitblit/ratchet-common';
import { Logger } from '@bitblit/ratchet-common';
import { BackgroundProcessor } from '../../config/background/background-processor.js';
import { StringRatchet } from '@bitblit/ratchet-common';
import { BackgroundManagerLike } from '../../background/manager/background-manager-like.js';

export class EchoProcessor implements BackgroundProcessor<any> {
  public static TYPE_NAME: string = 'EpsilonEcho';
  public get typeName(): string {
    return EchoProcessor.TYPE_NAME;
  }

  public async handleEvent(data: any, mgr?: BackgroundManagerLike): Promise<void> {
    Logger.info('Echo processing : %j', data);
    if (data && StringRatchet.trimToNull(data['error'])) {
      ErrorRatchet.throwFormattedErr('Forced error : %s', data['error']);
    }
  }
}

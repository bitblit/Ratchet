import { AbstractRatchetCliHandler } from '@bitblit/ratchet-node-only';
import { SiteUploader } from './site-uploader/site-uploader';
import { StartInstanceAndSsh } from './start-instance-and-ssh';
import { BuildInformation } from '@bitblit/ratchet-common/dist/types/build/build-information';
import { RatchetAwsNodeOnlyInfo } from '../build/ratchet-aws-node-only-info';

export class RatchetCliHandler extends AbstractRatchetCliHandler {
  fetchHandlerMap(): Record<string, any> {
    return {
      'site-uploader': SiteUploader.runFromCliArgs,
      'start-instance-and-ssh': StartInstanceAndSsh.runFromCliArgs,
    };
  }

  fetchVersionInfo(): BuildInformation {
    return RatchetAwsNodeOnlyInfo.buildInformation();
  }
}

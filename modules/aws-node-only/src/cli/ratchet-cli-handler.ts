import { AbstractRatchetCliHandler } from '@bitblit/ratchet-node-only';
import { SiteUploader } from './site-uploader/site-uploader.js';
import { StartInstanceAndSsh } from './start-instance-and-ssh.js';
import { BuildInformation } from '@bitblit/ratchet-common';
import { RatchetAwsNodeOnlyInfo } from '../build/ratchet-aws-node-only-info.js';

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

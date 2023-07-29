import { ApplyCiEnvVariablesToFiles } from '../ci/apply-ci-env-variables-to-files';
import { PublishCiReleaseToSlack } from '../third-party/slack/publish-ci-release-to-slack';
import { AbstractRatchetCliHandler } from './abstract-ratchet-cli-handler';
import { StartInstanceAndSsh } from '../aws/start-instance-and-ssh';
import { SiteUploader } from '../../site-uploader';
import { RatchetClassicInfo } from '../../common/build/ratchet-classic-info';
import { BuildInformation } from '../../common/build/build-information';
import { FilesToStaticClass } from '../files/files-to-static-class';

export class RatchetCliHandler extends AbstractRatchetCliHandler {
  fetchHandlerMap(): Record<string, any> {
    return {
      'apply-ci-env-variables-to-files': ApplyCiEnvVariablesToFiles.runFromCliArgs,
      'files-to-static-class': FilesToStaticClass.runFromCliArgs,
      'publish-ci-release-to-slack': PublishCiReleaseToSlack.runFromCliArgs,
      'start-instance-and-ssh': StartInstanceAndSsh.runFromCliArgs,
      'site-uploader': SiteUploader.runFromCliArgs,
    };
  }

  fetchVersionInfo(): BuildInformation {
    return RatchetClassicInfo.buildInformation();
  }
}

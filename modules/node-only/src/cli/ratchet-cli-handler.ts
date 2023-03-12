import { BuildInformation } from '@bitblit/ratchet-common/dist/types/build/build-information';
import { RatchetNodeOnlyInfo } from '../build/ratchet-node-only-info';
import { ApplyCiEnvVariablesToFiles } from '../ci/apply-ci-env-variables-to-files';
import { FilesToStaticClass } from '../files/files-to-static-class';
import { PublishCiReleaseToSlack } from '../third-party/slack/publish-ci-release-to-slack';
import { AbstractRatchetCliHandler } from './abstract-ratchet-cli-handler';

export class RatchetCliHandler extends AbstractRatchetCliHandler {
  fetchHandlerMap(): Record<string, any> {
    return {
      'apply-ci-env-variables-to-files': ApplyCiEnvVariablesToFiles.runFromCliArgs,
      'files-to-static-class': FilesToStaticClass.runFromCliArgs,
      'publish-ci-release-to-slack': PublishCiReleaseToSlack.runFromCliArgs,
    };
  }

  fetchVersionInfo(): BuildInformation {
    return RatchetNodeOnlyInfo.buildInformation();
  }
}

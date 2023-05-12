import { BuildInformation } from '@bitblit/ratchet-common';
import { RatchetNodeOnlyInfo } from '../build/ratchet-node-only-info.js';
import { ApplyCiEnvVariablesToFiles } from '../ci/apply-ci-env-variables-to-files.js';
import { FilesToStaticClass } from '../files/files-to-static-class.js';
import { PublishCiReleaseToSlack } from '../third-party/slack/publish-ci-release-to-slack.js';
import { AbstractRatchetCliHandler } from './abstract-ratchet-cli-handler.js';

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

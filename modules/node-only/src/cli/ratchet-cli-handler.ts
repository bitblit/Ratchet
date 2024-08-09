import { RatchetNodeOnlyInfo } from '../build/ratchet-node-only-info.js';
import { ApplyCiEnvVariablesToFiles } from '../ci/apply-ci-env-variables-to-files.js';
import { FilesToStaticClass } from '../files/files-to-static-class.js';
import { PublishCiReleaseToSlack } from '../third-party/slack/publish-ci-release-to-slack.js';
import { AbstractRatchetCliHandler } from './abstract-ratchet-cli-handler.js';
import { UniqueFileRename } from '../files/unique-file-rename.js';
import { BuildInformation } from "@bitblit/ratchet-common/build/build-information";

export class RatchetCliHandler extends AbstractRatchetCliHandler {
  fetchHandlerMap(): Record<string, any> {
    return {
      'apply-ci-env-variables-to-files': ApplyCiEnvVariablesToFiles.runFromCliArgs,
      'files-to-static-class': FilesToStaticClass.runFromCliArgs,
      'publish-ci-release-to-slack': PublishCiReleaseToSlack.runFromCliArgs,
      'unique-file-rename': UniqueFileRename.runFromCliArgs,
    };
  }

  fetchVersionInfo(): BuildInformation {
    return RatchetNodeOnlyInfo.buildInformation();
  }
}

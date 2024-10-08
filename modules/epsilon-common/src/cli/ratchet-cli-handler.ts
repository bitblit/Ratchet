import { AbstractRatchetCliHandler } from '@bitblit/ratchet-node-only/cli/abstract-ratchet-cli-handler';
import { BuildInformation } from '@bitblit/ratchet-common/build/build-information';
import { RunBackgroundProcessFromCommandLine } from './run-background-process-from-command-line.js';
import { TestErrorServer } from '../sample/test-error-server.js';
import { LocalContainerServer } from '../local-container-server.js';
import { RatchetEpsilonCommonInfo } from '../build/ratchet-epsilon-common-info.js';
import { LocalServer } from '../local-server.js';

export class RatchetCliHandler extends AbstractRatchetCliHandler {
  fetchHandlerMap(): Record<string, any> {
    return {
      'run-background-process': RunBackgroundProcessFromCommandLine.runFromCliArgs,
      'run-test-error-server': TestErrorServer.runFromCliArgs,
      'run-local-container-server': LocalContainerServer.runFromCliArgs,
      'run-sample-local-server': LocalServer.runSampleLocalServerFromCliArgs,
      'run-sample-local-batch-server': LocalServer.runSampleLocalServerFromCliArgs,
    };
  }

  fetchVersionInfo(): BuildInformation {
    return RatchetEpsilonCommonInfo.buildInformation();
  }
}

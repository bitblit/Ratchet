import { AbstractRatchetCliHandler } from '@bitblit/ratchet-node-only';
import { BuildInformation } from '@bitblit/ratchet-common/dist/types/build/build-information';
import { RunBackgroundProcessFromCommandLine } from './run-background-process-from-command-line';
import { TestErrorServer } from '../sample/test-error-server';
import { LocalContainerServer } from '../local-container-server';
import { RatchetEpsilonCommonInfo } from '../build/ratchet-epsilon-common-info';
import { LocalServer } from '../local-server';

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

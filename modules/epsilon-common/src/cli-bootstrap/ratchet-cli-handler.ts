import { AbstractRatchetCliHandler } from '@bitblit/ratchet-node-only';
import { BuildInformation } from '@bitblit/ratchet-common/dist/types/build/build-information';
import { RunBackgroundProcessFromCommandLine } from './run-background-process-from-command-line';
import { TestErrorServer } from '../test-error-server';
import { LocalContainerServer } from '../local-container-server';
import { RatchetEpsilonCommonInfo } from '../build/ratchet-epsilon-common-info';

export class RatchetCliHandler extends AbstractRatchetCliHandler {
  fetchHandlerMap(): Record<string, any> {
    return {
      'run-background-process': RunBackgroundProcessFromCommandLine.runFromCliArgs,
      'run-test-error-server': TestErrorServer.runFromCliArgs,
      'run-local-container-server': LocalContainerServer.runFromCliArgs,
    };
  }

  fetchVersionInfo(): BuildInformation {
    return RatchetEpsilonCommonInfo.buildInformation();
  }
}

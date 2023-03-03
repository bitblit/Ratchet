#!/usr/bin/env node

import { ApplyCiEnvVariablesToFiles } from '../node-only/ci/apply-ci-env-variables-to-files';
import { CliRatchet } from '../node-only/common/cli-ratchet';
import { Logger } from '../common/logger';

const progArgs: string[] = CliRatchet.argsAfterCommand([
  'ratchet-apply-ci-env-variables-to-files.js',
  'ratchet-apply-ci-env-variables-to-files',
]);
if (progArgs) {
  ApplyCiEnvVariablesToFiles.runFromCliArgs(progArgs)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

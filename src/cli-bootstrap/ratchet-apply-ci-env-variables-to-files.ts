#!/usr/bin/env node

import { ApplyCiEnvVariablesToFiles } from '../node-only/ci/apply-ci-env-variables-to-files';
import { CliRatchet } from '../node-only/common/cli-ratchet';
import { Logger } from '../common/logger';

if (
  process?.argv?.length &&
  CliRatchet.isCalledFromCLI(['ratchet-apply-ci-env-variables-to-files.js', 'ratchet-apply-ci-env-variables-to-files'])
) {
  ApplyCiEnvVariablesToFiles.runFromCliArgs(process.argv)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

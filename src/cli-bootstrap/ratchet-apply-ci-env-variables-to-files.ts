#!/usr/bin/env node

import { Logger } from '../common/logger.js';
import { ApplyCiEnvVariablesToFiles } from '../node-only/ci/apply-ci-env-variables-to-files.js';

if (process?.argv?.length && process.argv.includes('ratchet-apply-ci-env-variables-to-files.js')) {
  ApplyCiEnvVariablesToFiles.runFromCliArgs(process.argv)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

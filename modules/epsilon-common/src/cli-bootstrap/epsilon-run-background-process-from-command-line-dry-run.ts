#!/usr/bin/env node

import { RunBackgroundProcessFromCommandLine } from '../run-background-process-from-command-line';
import { CliRatchet } from '@bitblit/ratchet-node-only';
import { Logger } from '@bitblit/ratchet-common';

if (
  process?.argv?.length &&
  CliRatchet.isCalledFromCLI([
    'epsilon-run-background-process-from-command-line-dry-run.js',
    'epsilon-run-background-process-from-command-line-dry-run',
  ])
) {
  Logger.info('RunBackgroundProcessFromCommandLine requested (cli is %s) - starting', process?.argv);

  RunBackgroundProcessFromCommandLine.processBackgroundCliRequest(null, true)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

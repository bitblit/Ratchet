#!/usr/bin/env node

import { Logger } from '../common/logger.js';
import { FilesToStaticClass } from '../node-only/common/files-to-static-class.js';
import { CliRatchet } from '../node-only/common/cli-ratchet.js';

if (process?.argv?.length && CliRatchet.isCalledFromCLI('ratchet-files-to-static-class.js')) {
  FilesToStaticClass.runFromCliArgs(process.argv)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  Logger.info('u: %j', process.argv);
  // Ignore it - they weren't trying to run you
}

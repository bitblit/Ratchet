#!/usr/bin/env node

import { Logger } from '../common/logger';
import { FilesToStaticClass } from '../node-only/common/files-to-static-class';
import { CliRatchet } from '../node-only/common/cli-ratchet';

if (process?.argv?.length && CliRatchet.isCalledFromCLI(['ratchet-files-to-static-class.js', 'ratchet-files-to-static-class'])) {
  FilesToStaticClass.runFromCliArgs(process.argv)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

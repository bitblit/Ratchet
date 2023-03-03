#!/usr/bin/env node

import { Logger } from '../common/logger';
import { FilesToStaticClass } from '../node-only/common/files-to-static-class';
import { CliRatchet } from '../node-only/common/cli-ratchet';

const progArgs: string[] = CliRatchet.argsAfterCommand(['ratchet-files-to-static-class.js', 'ratchet-files-to-static-class']);
if (progArgs) {
  FilesToStaticClass.runFromCliArgs(progArgs)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

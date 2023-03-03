#!/usr/bin/env node

import { Logger } from '../common/logger';
import { SiteUploader } from '../site-uploader/site-uploader';
import { CliRatchet } from '../node-only/common/cli-ratchet';

const progArgs: string[] = CliRatchet.argsAfterCommand(['ratchet-site-uploader.js', 'ratchet-site-uploader']);
if (progArgs) {
  SiteUploader.createFromArgs(progArgs)
    .runPump()
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

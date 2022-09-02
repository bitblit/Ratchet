#!/usr/bin/env node

import { Logger } from '../common/logger.js';
import { SiteUploader } from '../site-uploader/site-uploader.js';

if (process?.argv?.length && process.argv.includes('ratchet-site-uploader.js')) {
  SiteUploader.createFromArgs()
    .runPump()
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

#!/usr/bin/env node

import { Logger } from '../common/logger.js';
import { StartInstanceAndSsh } from '../node-only/aws/start-instance-and-ssh.js';
import { CliRatchet } from '../node-only/common/cli-ratchet.js';

if (process?.argv?.length && CliRatchet.isCalledFromCLI(['ratchet-start-instance-and-ssh.js', 'ratchet-start-instance-and-ssh'])) {
  StartInstanceAndSsh.createFromArgs()
    .run()
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

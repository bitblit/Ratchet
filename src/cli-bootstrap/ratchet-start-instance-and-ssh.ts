#!/usr/bin/env node

import { Logger } from '../common/logger';
import { StartInstanceAndSsh } from '../node-only/aws/start-instance-and-ssh';
import { CliRatchet } from '../node-only/common/cli-ratchet';

const progArgs: string[] = CliRatchet.argsAfterCommand(['ratchet-start-instance-and-ssh.js', 'ratchet-start-instance-and-ssh']);
if (progArgs) {
  StartInstanceAndSsh.createFromArgs(progArgs)
    .run()
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

#!/usr/bin/env node

import { Logger } from '../common/logger';
import { PublishCiReleaseToSlack } from '../node-only/ci/publish-ci-release-to-slack';
import { CliRatchet } from '../node-only/common/cli-ratchet';

const progArgs: string[] = CliRatchet.argsAfterCommand(['ratchet-publish-ci-release-to-slack.js', 'ratchet-publish-ci-release-to-slack']);
if (progArgs) {
  PublishCiReleaseToSlack.runFromCliArgs(progArgs)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}

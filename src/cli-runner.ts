#!/usr/bin/env node

import { Logger } from './common/logger.js';
import { ApplyCiEnvVariablesToFiles } from './node-only/ci/apply-ci-env-variables-to-files.js';
import { FilesToStaticClass } from './node-only/common/files-to-static-class.js';
import { PublishCiReleaseToSlack } from './node-only/ci/publish-ci-release-to-slack.js';
import { StartInstanceAndSsh } from './node-only/aws/start-instance-and-ssh.js';
import { SiteUploader } from './site-uploader/site-uploader.js';

if (process?.argv?.length) {
  if (process.argv.includes('ratchet-start-instance-and-ssh')) {
    StartInstanceAndSsh.createFromArgs()
      .run()
      .then((out) => {
        Logger.info('Result : %s', out);
      })
      .catch((err) => Logger.error('Failed : %s', err));
  } else if (process.argv.includes('ratchet-apply-ci-env-variables-to-files')) {
    ApplyCiEnvVariablesToFiles.runFromCliArgs(process.argv)
      .then((out) => {
        Logger.info('Result : %s', out);
      })
      .catch((err) => Logger.error('Failed : %s', err));
  } else if (process.argv.includes('ratchet-publish-ci-release-to-slack')) {
    PublishCiReleaseToSlack.runFromCliArgs(process.argv)
      .then((out) => {
        Logger.info('Result : %s', out);
      })
      .catch((err) => Logger.error('Failed : %s', err));
  } else if (process.argv.includes('ratchet-files-to-static-class')) {
    FilesToStaticClass.runFromCliArgs(process.argv)
      .then((out) => {
        Logger.info('Result : %s', out);
      })
      .catch((err) => Logger.error('Failed : %s', err));
  } else if (process.argv.includes('ratchet-site-uploader')) {
    SiteUploader.createFromArgs()
      .runPump()
      .then((out) => {
        Logger.info('Result : %s', out);
      })
      .catch((err) => Logger.error('Failed : %s', err));
  } else {
    // Ignore it - they weren't trying to run you
  }
}

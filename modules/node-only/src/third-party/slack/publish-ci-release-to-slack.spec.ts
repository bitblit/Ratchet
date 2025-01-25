import { PublishCiReleaseToSlack } from './publish-ci-release-to-slack.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { GlobalRatchet } from '@bitblit/ratchet-common/lang/global-ratchet';

describe('#publishCircleCiReleaseToSlack', function () {
  test.skip('should fail if not in a circle ci environment', async () => {
    try {
      const result: string = await PublishCiReleaseToSlack.process('https://testslack.erigir.com');
      this.bail();
    } catch (err) {
      Logger.debug('Caught expected error : %s', err);
      // Expected, return ok
    }
  });

  test.skip('should not fail if in a circle ci environment', async () => {
    GlobalRatchet.setGlobalEnvVar('CIRCLE_BUILD_NUM', '1');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_BRANCH', 'B');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_TAG', 'T');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_SHA1', 'S');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_USERNAME', 'cweiss');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_PROJECT_REPONAME', 'tester');

    const result: string = await PublishCiReleaseToSlack.process('slackUrlHere');
    expect(result).toEqual('ok');
  });
});

import { Logger } from '@bitblit/ratchet-common/dist/logger/logger.js';
import { GlobalRatchet } from '@bitblit/ratchet-common/dist/lang/global-ratchet.js';
import { PublishCiReleaseToSlack } from './publish-ci-release-to-slack.js';

describe('#publishCircleCiReleaseToSlack', function () {
  xit('should fail if not in a circle ci environment', async () => {
    try {
      const result: string = await PublishCiReleaseToSlack.process('https://testslack.erigir.com');
      this.bail();
    } catch (err) {
      Logger.debug('Caught expected error : %s', err);
      // Expected, return ok
    }
  });

  xit('should not fail if in a circle ci environment', async () => {
    GlobalRatchet.setGlobalVar('CIRCLE_BUILD_NUM', '1');
    GlobalRatchet.setGlobalVar('CIRCLE_BRANCH', 'B');
    GlobalRatchet.setGlobalVar('CIRCLE_TAG', 'T');
    GlobalRatchet.setGlobalVar('CIRCLE_SHA1', 'S');
    GlobalRatchet.setGlobalVar('CIRCLE_USERNAME', 'cweiss');
    GlobalRatchet.setGlobalVar('CIRCLE_PROJECT_REPONAME', 'tester');

    const result: string = await PublishCiReleaseToSlack.process('slackUrlHere');
    expect(result).toEqual('ok');
  });
});

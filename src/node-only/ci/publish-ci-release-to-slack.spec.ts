import { Logger } from '../../common/logger.js';
import { PublishCiReleaseToSlack } from './publish-ci-release-to-slack.js';
import { NodeRatchet } from '../common/node-ratchet.js';

describe('#publishCircleCiReleaseToSlack', function () {
  it('should fail if not in a circle ci environment', async () => {
    try {
      const result: string = await PublishCiReleaseToSlack.process('https://testslack.erigir.com');
      this.bail();
    } catch (err) {
      Logger.debug('Caught expected error : %s', err);
      // Expected, return ok
    }
  });

  xit('should not fail if in a circle ci environment', async () => {
    NodeRatchet.setProcessEnvVar('CIRCLE_BUILD_NUM', '1');
    NodeRatchet.setProcessEnvVar('CIRCLE_BRANCH', 'B');
    NodeRatchet.setProcessEnvVar('CIRCLE_TAG', 'T');
    NodeRatchet.setProcessEnvVar('CIRCLE_SHA1', 'S');
    NodeRatchet.setProcessEnvVar('CIRCLE_USERNAME', 'cweiss');
    NodeRatchet.setProcessEnvVar('CIRCLE_PROJECT_REPONAME', 'tester');

    const result: string = await PublishCiReleaseToSlack.process('slackUrlHere');
    expect(result).toEqual('ok');
  });
});

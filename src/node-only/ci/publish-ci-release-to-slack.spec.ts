import {Logger} from '../../common/logger';
import {PublishCiReleaseToSlack} from './publish-ci-release-to-slack';

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
    process.env['CIRCLE_BUILD_NUM'] = '1';
    process.env['CIRCLE_BRANCH'] = 'B';
    process.env['CIRCLE_TAG'] = 'T';
    process.env['CIRCLE_SHA1'] = 'S';
    process.env['CIRCLE_USERNAME'] = 'cweiss';
    process.env['CIRCLE_PROJECT_REPONAME'] = 'tester';

    const result: string = await PublishCiReleaseToSlack.process('slackUrlHere');
    expect(result).toEqual('ok');
  });
});

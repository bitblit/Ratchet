import { GlobalRatchet } from '../../common/global-ratchet';
import { Logger } from '../../common/logger';
import { ApplyCiEnvVariablesToFiles } from './apply-ci-env-variables-to-files';
import { CiRunInformationUtil } from './ci-run-information-util';

describe('#applyCiEnvVariablesToFiles', function () {
  xit('should fail if not in a ci environment', async () => {
    try {
      const result: number = await ApplyCiEnvVariablesToFiles.process(
        ['test1.txt'],
        CiRunInformationUtil.createDefaultCircleCiRunInformation(),
      );
      this.bail();
    } catch (err) {
      Logger.debug('Caught expected error : %s', err['message']);
      // Expected, return ok
    }
  });

  it('should not fail if in a ci environment', async () => {
    GlobalRatchet.setGlobalVar('CIRCLE_BUILD_NUM', '1');
    GlobalRatchet.setGlobalVar('CIRCLE_BRANCH', 'B');
    GlobalRatchet.setGlobalVar('CIRCLE_TAG', 'T');
    GlobalRatchet.setGlobalVar('CIRCLE_SHA1', 'S');

    const result: number = await ApplyCiEnvVariablesToFiles.process([], CiRunInformationUtil.createDefaultCircleCiRunInformation());
    expect(result).toEqual(0);
  });
});

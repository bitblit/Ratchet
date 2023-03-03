import { ApplyCiEnvVariablesToFiles } from './apply-ci-env-variables-to-files';
import { Logger } from '../../common/logger';
import { CiRunInformationUtil } from './ci-run-information-util';
import { NodeRatchet } from '../common/node-ratchet';

describe('#applyCiEnvVariablesToFiles', function () {
  it('should fail if not in a ci environment', async () => {
    try {
      const result: number = await ApplyCiEnvVariablesToFiles.process(
        ['test1.txt'],
        CiRunInformationUtil.createDefaultCircleCiRunInformation()
      );
      this.bail();
    } catch (err) {
      Logger.debug('Caught expected error : %s', err['message']);
      // Expected, return ok
    }
  });

  it('should not fail if in a ci environment', async () => {
    NodeRatchet.setProcessEnvVar('CIRCLE_BUILD_NUM', '1');
    NodeRatchet.setProcessEnvVar('CIRCLE_BRANCH', 'B');
    NodeRatchet.setProcessEnvVar('CIRCLE_TAG', 'T');
    NodeRatchet.setProcessEnvVar('CIRCLE_SHA1', 'S');

    const result: number = await ApplyCiEnvVariablesToFiles.process([], CiRunInformationUtil.createDefaultCircleCiRunInformation());
    expect(result).toEqual(0);
  });
});

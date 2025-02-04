import { ApplyCiEnvVariablesToFiles } from './apply-ci-env-variables-to-files.js';
import { CiRunInformationUtil } from './ci-run-information-util.js';
import { describe, expect, test } from 'vitest';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { GlobalRatchet } from '@bitblit/ratchet-common/lang/global-ratchet';

describe('#applyCiEnvVariablesToFiles', function () {
  test.skip('should fail if not in a ci environment', async () => {
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

  test('should not fail if in a ci environment', async () => {
    GlobalRatchet.setGlobalEnvVar('CIRCLE_BUILD_NUM', '1');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_BRANCH', 'B');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_TAG', 'T');
    GlobalRatchet.setGlobalEnvVar('CIRCLE_SHA1', 'S');

    const result: number = await ApplyCiEnvVariablesToFiles.process([], CiRunInformationUtil.createDefaultCircleCiRunInformation());
    expect(result).toEqual(0);
  });
});

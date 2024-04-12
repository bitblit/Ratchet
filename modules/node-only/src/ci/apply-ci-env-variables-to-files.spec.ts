import { ApplyCiEnvVariablesToFiles } from './apply-ci-env-variables-to-files.js';
import { Logger } from '@bitblit/ratchet-common';
import { GlobalRatchet } from '@bitblit/ratchet-common';
import { CiRunInformationUtil } from './ci-run-information-util.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

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
    GlobalRatchet.setGlobalVar('CIRCLE_BUILD_NUM', '1');
    GlobalRatchet.setGlobalVar('CIRCLE_BRANCH', 'B');
    GlobalRatchet.setGlobalVar('CIRCLE_TAG', 'T');
    GlobalRatchet.setGlobalVar('CIRCLE_SHA1', 'S');

    const result: number = await ApplyCiEnvVariablesToFiles.process([], CiRunInformationUtil.createDefaultCircleCiRunInformation());
    expect(result).toEqual(0);
  });
});

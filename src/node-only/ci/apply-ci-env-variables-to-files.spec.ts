import { ApplyCiEnvVariablesToFiles } from './apply-ci-env-variables-to-files';
import { Logger } from '../../common/logger';
import { CiEnvVariableConfigUtil } from './ci-env-variable-config-util';

describe('#applyCiEnvVariablesToFiles', function () {
  it('should fail if not in a ci environment', async () => {
    try {
      const result: number = await ApplyCiEnvVariablesToFiles.process(
        ['test1.txt'],
        CiEnvVariableConfigUtil.createDefaultCircleCiVariableConfig()
      );
      this.bail();
    } catch (err) {
      Logger.debug('Caught expected error : %s', err['message']);
      // Expected, return ok
    }
  });

  it('should not fail if in a ci environment', async () => {
    process.env['CIRCLE_BUILD_NUM'] = '1';
    process.env['CIRCLE_BRANCH'] = 'B';
    process.env['CIRCLE_TAG'] = 'T';
    process.env['CIRCLE_SHA1'] = 'S';

    const result: number = await ApplyCiEnvVariablesToFiles.process([], CiEnvVariableConfigUtil.createDefaultCircleCiVariableConfig());
    expect(result).toEqual(0);
  });
});

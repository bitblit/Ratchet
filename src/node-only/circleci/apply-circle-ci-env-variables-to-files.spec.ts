import { ApplyCircleCiEnvVariablesToFiles } from './apply-circle-ci-env-variables-to-files';
import { Logger } from '../../common/logger';

describe('#applyCircleCiEnvVariablesToFiles', function () {
  it('should fail if not in a circle ci environment', async () => {
    try {
      const result: number = await ApplyCircleCiEnvVariablesToFiles.process(['test1.txt']);
      this.bail();
    } catch (err) {
      Logger.debug('Caught expected error : %s', err['message']);
      // Expected, return ok
    }
  });

  it('should not fail if in a circle ci environment', async () => {
    process.env['CIRCLE_BUILD_NUM'] = '1';
    process.env['CIRCLE_BRANCH'] = 'B';
    process.env['CIRCLE_TAG'] = 'T';
    process.env['CIRCLE_SHA1'] = 'S';

    const result: number = await ApplyCircleCiEnvVariablesToFiles.process([]);
    expect(result).toEqual(0);
  });
});

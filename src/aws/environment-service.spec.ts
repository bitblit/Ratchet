import { Substitute } from '@fluffy-spoon/substitute';
import { EnvironmentService } from './environment-service';
import { Logger } from '../common/logger';

describe('#environmentService', function () {
  xit('should throw exception on missing environment values', async () => {
    try {
      const vals: any = await EnvironmentService.getConfig('i_do_not_exist');
      this.bail();
    } catch (err) {
      expect(err).toBeTruthy();
      Logger.info('Success - threw %s', err);
    }
  });

  xit('should find a valid value', async () => {
    const vals: any = await EnvironmentService.getConfig('xxx', 'us-east-1', true);
    expect(vals).toBeTruthy();
  });

  xit('should load config from s3', async () => {
    Logger.setLevelByName('silly');
    const bucket: string = 'xxx';
    const path: string = 'yyy';

    const vals: any = await EnvironmentService.getConfigS3(bucket, path, 'us-east-1');
    const vals1: any = await EnvironmentService.getConfigS3(bucket, path, 'us-east-1');
    const vals2: any = await EnvironmentService.getConfigS3(bucket, path, 'us-east-1');
    expect(vals).toBeTruthy();
  });
});

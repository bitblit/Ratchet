import { S3EnvironmentService } from './s3-environment-service';
import AWS from 'aws-sdk';
import { SsmEnvironmentService } from './ssm-environment-service';
import { Logger } from '../../common';

describe('#s3EnvironmentService', function () {
  let service: S3EnvironmentService;
  beforeEach(() => {
    service = new S3EnvironmentService(new AWS.S3({ region: 'us-east-1' }));
  });

  xit('should load config from s3', async () => {
    Logger.setLevelByName('silly');
    const bucket: string = 'xxx';
    const path: string = 'yyy';

    const vals: any = await service.getConfig(bucket, path);
    const vals1: any = await service.getConfig(bucket, path);
    const vals2: any = await service.getConfig(bucket, path);
    expect(vals).toBeTruthy();
  });
});

describe('#ssmEnvironmentService', function () {
  let service: SsmEnvironmentService;
  beforeEach(() => {
    service = new SsmEnvironmentService(new AWS.SSM({ region: 'us-east-1' }));
  });

  xit('should throw exception on missing environment values', async () => {
    try {
      const vals: any = await service.getConfig('i_do_not_exist');
      this.bail();
    } catch (err) {
      expect(err).toBeTruthy();
      Logger.info('Success - threw %s', err);
    }
  });

  xit('should find a valid value', async () => {
    const vals: any = await service.getConfig('xxx', true);
    expect(vals).toBeTruthy();
  });
});

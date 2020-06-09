import { expect } from 'chai';
import { BooleanRatchet } from '../../src/common/boolean-ratchet';
import * as AWS from 'aws-sdk';
import { S3CacheRatchet } from '../../src/aws/s3-cache-ratchet';
import { EnvironmentService } from '../../src/aws/environment-service';
import { Logger } from '../../src/common/logger';

describe('#environmentService', function () {
  this.timeout(30000);
  xit('should throw exception on missing environment values', async () => {
    try {
      const vals: any = await EnvironmentService.getConfig('i_do_not_exist');
      this.bail();
    } catch (err) {
      expect(err).to.not.be.null;
      Logger.info('Success - threw %s', err);
    }
  });

  xit('should find a valid value', async () => {
    const vals: any = await EnvironmentService.getConfig('xxx', 'us-east-1', true);
    expect(vals).to.not.be.null;
  });

  xit('should load config from s3', async () => {
    Logger.setLevelByName('silly');
    const bucket: string = 'xxx';
    const path: string = 'yyy';

    const vals: any = await EnvironmentService.getConfigS3(bucket, path, 'us-east-1');
    const vals1: any = await EnvironmentService.getConfigS3(bucket, path, 'us-east-1');
    const vals2: any = await EnvironmentService.getConfigS3(bucket, path, 'us-east-1');
    expect(vals).to.not.be.null;
  });
});

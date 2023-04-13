import { EnvironmentService } from './environment-service.js';
import { Logger } from '@bitblit/ratchet-common/dist/logger/logger.js';
import { FixedEnvironmentServiceProvider } from './fixed-environment-service-provider.js';

const fixed: FixedEnvironmentServiceProvider<any> = FixedEnvironmentServiceProvider.fromRecord<any>({ a: 'b', c: 5 });

describe('#environmentService', function () {
  it('should throw exception on missing environment values', async () => {
    try {
      const es: EnvironmentService<any> = new EnvironmentService(fixed);
      const vals: any = await es.getConfig('i_do_not_exist');
      this.bail('Should not have returned a value');
    } catch (err) {
      expect(err).toBeTruthy();
      Logger.info('Success - threw %s', err);
    }
  });

  it('should find a valid value', async () => {
    const es: EnvironmentService<any> = new EnvironmentService(fixed);
    const vals: any = await es.getConfig('c');
    expect(vals).toBeTruthy();
  });
  /*
  xit('should load config from s3', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    const bucket: string = 'xxx';
    const path: string = 'yyy';

    const es: EnvironmentService<any> = new EnvironmentService<any>(
      new S3EnvironmentServiceProvider({ bucketName: bucket, region: 'us-east-1' })
    );
    const vals: any = await es.getConfig(path);
    const vals1: any = await es.getConfig(path);
    const vals2: any = await es.getConfig(path);
    expect(vals).toBeTruthy();
  });
  
 */
});

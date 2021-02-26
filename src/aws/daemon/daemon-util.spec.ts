import AWS from 'aws-sdk';
import { S3CacheRatchet } from '../s3-cache-ratchet';
import { DaemonProcessState } from './daemon-process-state';
import { DaemonUtil } from './daemon-util';
import { Logger } from '../../common/logger';
import { ReadStream } from 'fs';
import fs from 'fs';
import { DaemonProcessCreateOptions } from './index';

describe('#DaemonUtil', function () {
  xit('should test the daemon util', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');

    const t1: DaemonProcessState = await DaemonUtil.stat(cache, 'test1.csv');
    Logger.info('Got : %j', t1);

    /*
        let id = 'test';
        const newDaemonOptions: DaemonProcessCreateOptions = {
            title: 'test',
            contentType: 'text/csv',
            group: 'NA',
            meta: {},
            targetFileName: 'test.csv'
        };

        const t2: DaemonProcessState = await DaemonUtil.start(cache, id,'test1.csv', newDaemonOptions);
        Logger.info('Got : %j', t2);

         */

    const t2: DaemonProcessState = await DaemonUtil.updateMessage(cache, 'test1.csv', 'msg : ' + new Date());
    Logger.info('Got : %j', t2);

    const result: DaemonProcessState = await DaemonUtil.stat(cache, 'test1.csv');

    Logger.info('Got : %j', result);

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
  });

  xit('should test the daemon util streaming', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const key: string = 's3-cache-ratchet.spec.ts';

    const newDaemonOptions: DaemonProcessCreateOptions = {
      title: 'test',
      contentType: 'text/plain',
      group: 'NA',
      meta: {},
      targetFileName: 's3-cache-ratchet.spec.ts',
    };

    const t2: DaemonProcessState = await DaemonUtil.start(cache, key, 's3-cache-ratchet.spec.ts', newDaemonOptions);

    const t1: DaemonProcessState = await DaemonUtil.stat(cache, key);
    Logger.info('Got : %j', t1);

    const stream: ReadStream = fs.createReadStream('test/aws/s3-cache-ratchet.spec.ts');
    const result: DaemonProcessState = await DaemonUtil.streamDataAndFinish(cache, key, stream);

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
  });
});

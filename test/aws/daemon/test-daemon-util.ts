import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import { S3CacheRatchet } from '../../../src/aws/s3-cache-ratchet';
import { DaemonProcessCreateOptions } from '../../../src/aws/daemon/daemon-process-create-options';
import { DaemonProcessState } from '../../../src/aws/daemon/daemon-process-state';
import { DaemonUtil } from '../../../src/aws/daemon/daemon-util';
import { Logger } from '../../../src/common/logger';

describe('#DaemonUtil', function () {
  this.timeout(30000);
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

    expect(result).to.not.be.null;
    Logger.info('Got objects : %j', result);
  });
});

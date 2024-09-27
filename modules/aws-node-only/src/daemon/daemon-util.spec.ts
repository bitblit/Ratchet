import { DaemonProcessState } from './daemon-process-state.js';
import { DaemonUtil } from './daemon-util.js';
import fs, { ReadStream } from 'fs';
import { DaemonProcessCreateOptions } from './daemon-process-create-options.js';

import { Subject } from 'rxjs';
import { PassThrough } from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { CsvRatchet } from '@bitblit/ratchet-node-only/csv/csv-ratchet';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { LoggerLevelName } from '@bitblit/ratchet-common/logger/logger-level-name';
import { S3CacheRatchetLike } from '@bitblit/ratchet-aws/s3/s3-cache-ratchet-like';
import { S3CacheRatchet } from '@bitblit/ratchet-aws/s3/s3-cache-ratchet';

let mockS3CR: MockProxy<S3CacheRatchetLike>;

describe('#DaemonUtil', function () {
  beforeEach(() => {
    mockS3CR = mock<S3CacheRatchetLike>();
  });

  test('should test the daemon util', async () => {
    mockS3CR.getDefaultBucket.mockReturnValueOnce('TEST-BUCKET');
    mockS3CR.fetchMetaForCacheFile.mockResolvedValue({
      Metadata: { daemon_meta: '{"id":"testid", "completedEpochMS":123456}' },
      $metadata: null,
    });
    mockS3CR.preSignedDownloadUrlForCacheFile.mockResolvedValue('https://test-link');

    const t1: DaemonProcessState = await DaemonUtil.stat(mockS3CR, 'test1.csv');
    Logger.info('Got : %j', t1);
    expect(t1).not.toBeNull();
    expect(t1.link).not.toBeNull();

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


    const t2: DaemonProcessState = await DaemonUtil.updateMessage(mockS3CR, 'test1.csv', 'msg : ' + new Date());
    Logger.info('Got : %j', t2);

    const result: DaemonProcessState = await DaemonUtil.stat(mockS3CR, 'test1.csv');

    Logger.info('Got : %j', result);

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
         */
  });

  test.skip('should test the daemon util streaming', async () => {
    const s3: S3Client = new S3Client({ region: 'us-east-1' });
    const cache: S3CacheRatchetLike = new S3CacheRatchet(s3, 'test-bucket');
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

  test.skip('should stream objects to a csv', async () => {
    Logger.setLevel(LoggerLevelName.debug);
    const sub: Subject<TestItem> = new Subject<TestItem>();
    const out: PassThrough = new PassThrough();
    const s3: S3Client = new S3Client({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const key: string = 'test.csv';

    const newDaemonOptions: DaemonProcessCreateOptions = {
      title: 'test',
      contentType: 'text/csv',
      group: 'NA',
      meta: {},
      targetFileName: 'test.csv',
    };
    const t2: DaemonProcessState = await DaemonUtil.start(cache, key, key, newDaemonOptions);

    const dProm: Promise<DaemonProcessState> = DaemonUtil.streamDataAndFinish(cache, key, out);

    const prom: Promise<number> = CsvRatchet.streamObjectsToCsv<TestItem>(sub, out); //, opts);

    for (let i = 1; i < 6; i++) {
      Logger.debug('Proc : %d', i);
      sub.next({ a: i, b: 'test ' + i + ' ,,' });
      await PromiseRatchet.wait(10);
    }
    sub.complete();

    Logger.debug('Waiting on write');

    const result: number = await prom;
    Logger.debug('Write complete');

    const val: DaemonProcessState = await dProm;

    expect(result).toEqual(5);
    Logger.debug('Have res : %d and val : \n%j', result, val);
  });
});

export interface TestItem {
  a: number;
  b: string;
}

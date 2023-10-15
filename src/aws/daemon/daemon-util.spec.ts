import { S3CacheRatchet } from '../s3/s3-cache-ratchet';
import { DaemonProcessState } from './daemon-process-state';
import { DaemonUtil } from './daemon-util';
import { Logger } from '../../common/logger';
import { PromiseRatchet } from '../../common/promise-ratchet';
import { LoggerLevelName } from '../../common/logger-support/logger-level-name';
import { CsvRatchet } from '../../node-csv/csv-ratchet';
import { JestRatchet } from '../../jest/jest-ratchet';
import fs, { ReadStream } from 'fs';
import { DaemonProcessCreateOptions } from './daemon-process-create-options';
import { Subject } from 'rxjs';
import { PassThrough } from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { jest } from '@jest/globals';
import { S3CacheRatchetLike } from '../s3/s3-cache-ratchet-like';
import { AwsCredentialsRatchet } from '../iam/aws-credentials-ratchet';
import { Uint8ArrayRatchet } from '../../common';

let mockS3CR: jest.Mocked<S3CacheRatchetLike>;

describe('#DaemonUtil', function () {
  beforeEach(() => {
    mockS3CR = JestRatchet.mock<S3CacheRatchetLike>(jest.fn);
  });

  it('should test the daemon util', async () => {
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

  xit('should test the daemon util buffered', async () => {
    AwsCredentialsRatchet.applySetProfileEnvironmentalVariable('test-credential');
    const s3: S3Client = new S3Client({ region: 'us-east-1' });
    const cache: S3CacheRatchetLike = new S3CacheRatchet(s3, 'test-lambda-work');
    const key: string = 'daemon-util-spec-ts.json';

    const newDaemonOptions: DaemonProcessCreateOptions = {
      title: 'test',
      contentType: 'application/json',
      group: 'NA',
      meta: {},
      targetFileName: key,
    };

    const t2: DaemonProcessState = await DaemonUtil.start(cache, key, key, newDaemonOptions);

    const t1: DaemonProcessState = await DaemonUtil.stat(cache, key);
    Logger.info('Got : %j', t1);

    expect(t1).toBeTruthy();
    expect(t1.meta).toBeTruthy();

    const arr: Uint8Array = Uint8ArrayRatchet.utf8StringToUint8Array(JSON.stringify({ a: 'b', c: 2 }));
    const t3: DaemonProcessState = await DaemonUtil.finalize(cache, key, arr);
    expect(t3).toBeTruthy();
    expect(t3.meta).toBeTruthy();

    Logger.info('Got objects : %j', t3);
  });

  xit('should test the daemon util streaming', async () => {
    AwsCredentialsRatchet.applySetProfileEnvironmentalVariable('test-credential');
    const s3: S3Client = new S3Client({ region: 'us-east-1' });
    const cache: S3CacheRatchetLike = new S3CacheRatchet(s3, 'test-lambda-work');
    const key: string = 'daemon-util.spec.ts';

    const newDaemonOptions: DaemonProcessCreateOptions = {
      title: 'test',
      contentType: 'text/plain',
      group: 'NA',
      meta: {},
      targetFileName: 'daemon-util.spec.ts',
    };

    const t2: DaemonProcessState = await DaemonUtil.start(cache, key, 'daemon-util.spec.ts', newDaemonOptions);

    const t1: DaemonProcessState = await DaemonUtil.stat(cache, key);
    Logger.info('Got : %j', t1);

    const stream: ReadStream = fs.createReadStream('src/aws/daemon/daemon-util.spec.ts');
    const result: DaemonProcessState = await DaemonUtil.streamDataAndFinish(cache, key, stream);

    expect(result).toBeTruthy();
    Logger.info('Got objects : %j', result);
  });

  xit('should stream objects to a csv', async () => {
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

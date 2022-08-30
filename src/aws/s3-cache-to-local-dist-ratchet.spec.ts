import AWS from 'aws-sdk';
import { S3CacheToLocalDiskRatchet } from './s3-cache-to-local-disk-ratchet';
import { S3CacheRatchet } from './s3-cache-ratchet';
import { Logger } from '../common/logger.js';
import { tmpdir } from 'os';

describe('#S3CacheToLocalDiskRatchet', () => {
  xit('should download file and store in tmp', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const pth: string = 'test-path';

    const svc: S3CacheToLocalDiskRatchet = new S3CacheToLocalDiskRatchet(cache, tmpdir()); //, 'tmp', 1000);
    svc.removeCacheFileForKey(pth);

    const proms: Promise<Buffer>[] = [];
    for (let i = 0; i < 5; i++) {
      proms.push(svc.getFileBuffer(pth));
    }

    const all: Buffer[] = await Promise.all(proms);

    //const res: string = await svc.getFileString('some-key');
    Logger.info('Wrote %j', all.length);
  });
});

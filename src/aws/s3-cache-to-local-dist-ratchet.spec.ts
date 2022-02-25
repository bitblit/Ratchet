import AWS from 'aws-sdk';
import { S3CacheToLocalDiskRatchet } from './s3-cache-to-local-disk-ratchet';
import { S3CacheRatchet } from './s3-cache-ratchet';
import { Logger } from '../common';

describe('#reportService', () => {
  xit('should download file and store in tmp', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test1');

    const svc: S3CacheToLocalDiskRatchet = new S3CacheToLocalDiskRatchet(cache, 'tmp', 1000);

    const res: string = await svc.getFileBuffer(
      'audience_offsets/20200221/Retail->GroceryStores->Wakefern->ShopRite.bin',
      'adomni-placeiq-sync'
    );
    Logger.info('Wrote %j', res);
  });
});

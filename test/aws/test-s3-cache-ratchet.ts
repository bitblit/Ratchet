import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import { S3CacheRatchet } from '../../src/aws/s3-cache-ratchet';
import { Logger } from '../../src/common/logger';
import { CopyObjectOutput, CopyObjectResult, PutObjectOutput } from 'aws-sdk/clients/s3';
import * as fs from 'fs';
import { ReadStream } from 'fs';

describe('#fileExists', function () {
  xit('should return false for files that do not exist', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const out: boolean = await cache.fileExists('test-missing-file');

    expect(out).to.equal(false);
  });

  xit('should create a expiring link', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const out: string = await cache.createDownloadLink('test.jpg', 300);

    Logger.info('Got: %s', out);
    expect(out).to.not.be.null;
  });

  xit('should copy an object', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const out: boolean = await cache.quietCopyFile('test.png', 'test2.png');

    Logger.info('Got: %s', out);
    expect(out).to.not.be.null;
  });

  xit('should copy a file to s3', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const stream: ReadStream = fs.createReadStream('test/aws/test-s3-cache-ratchet.ts');

    const out: PutObjectOutput = await cache.writeStreamToCacheFile('test-s3-cache-ratchet.ts', stream, null, {}, null, 'text/typescript');

    Logger.info('Got: %s', out);
    expect(out).to.not.be.null;
  });

  xit('should list direct children past 1000', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const out: string[] = await cache.directChildrenOfPrefix('test/aws/test-path-with-lots-of-childen/');
    expect(out).to.not.be.null;
    expect(out.length).to.be.gt(1000);

    Logger.info('Got: %s', out);
    expect(out).to.not.be.null;
  });
});

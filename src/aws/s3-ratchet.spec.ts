import AWS from 'aws-sdk';
import { S3CacheRatchet } from './s3-cache-ratchet';
import { Logger } from '../common/logger';
import { CopyObjectOutput, GetObjectOutput, HeadObjectOutput, PutObjectOutput } from 'aws-sdk/clients/s3';
import { JestRatchet } from '../jest';
import { StringReadable } from '../stream/string-readable';
import { Readable } from 'stream';
import { RequireRatchet, StringRatchet } from '../common';
import { S3Ratchet } from './s3-ratchet';

let mockS3: jest.Mocked<AWS.S3>;

describe('#S3Ratchet', function () {
  beforeEach(() => {
    mockS3 = JestRatchet.mock();
  });

  it('should generate a pre-signed url', async () => {
    mockS3.getSignedUrlPromise.mockResolvedValue('https://tester');
    const out: string = await S3Ratchet.createPresignedUrl(mockS3, 'getObject', {
      Bucket: 'test',
      Key: 'testKey',
      Expires: 3600,
    });
    expect(out).toBeTruthy();
    //expect(out).not.toBeNull();
  });

  it('should checkS3UrlForValidity', async () => {
    expect(S3Ratchet.checkS3UrlForValidity('s3://test/out/b.txt')).toBeTruthy();
    expect(S3Ratchet.checkS3UrlForValidity('http://test/out/b.txt')).toBeFalsy();
  });

  it('should extractBucketFromURL', async () => {
    expect(S3Ratchet.extractBucketFromURL('s3://test/out/b.txt')).toEqual('test');
  });

  it('should extractKeyFromURL', async () => {
    expect(S3Ratchet.extractKeyFromURL('s3://test/out/b.txt')).toEqual('out/b.txt');
  });
});

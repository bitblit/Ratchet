import { S3 } from '@aws-sdk/client-s3';
import { JestRatchet } from '../jest';
import { S3Ratchet } from './s3-ratchet';

let mockS3: jest.Mocked<S3>;

describe('#S3Ratchet', function () {
  beforeEach(() => {
    mockS3 = JestRatchet.mock();
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

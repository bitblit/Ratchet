import { S3Client } from '@aws-sdk/client-s3';
import { S3Ratchet } from './s3-ratchet.js';
import { mockClient } from 'aws-sdk-client-mock';
import { beforeEach, describe, expect, test } from 'vitest';

let mockS3;

describe('#S3Ratchet', function () {
  mockS3 = mockClient(S3Client);
  beforeEach(() => {
    mockS3.reset();
  });

  test('should checkS3UrlForValidity', async () => {
    expect(S3Ratchet.checkS3UrlForValidity('s3://test/out/b.txt')).toBeTruthy();
    expect(S3Ratchet.checkS3UrlForValidity('http://test/out/b.txt')).toBeFalsy();
  });

  test('should extractBucketFromURL', async () => {
    expect(S3Ratchet.extractBucketFromURL('s3://test/out/b.txt')).toEqual('test');
  });

  test('should extractKeyFromURL', async () => {
    expect(S3Ratchet.extractKeyFromURL('s3://test/out/b.txt')).toEqual('out/b.txt');
  });
});

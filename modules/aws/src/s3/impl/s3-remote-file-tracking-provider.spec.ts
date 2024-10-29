import { beforeEach, describe, expect, test } from 'vitest';
import { S3RemoteFileTrackingProvider } from './s3-remote-file-tracking-provider.js';
import { mock, MockProxy } from 'vitest-mock-extended';
import { S3CacheRatchetLike } from '../s3-cache-ratchet-like.js';
import { S3CacheRatchet } from '../s3-cache-ratchet.js';
import { S3Client } from '@aws-sdk/client-s3';
import { S3RemoteFileTrackingProviderOptions } from './s3-remote-file-tracking-provider-options.js';
import { AwsCredentialsRatchet } from '../../iam/aws-credentials-ratchet.js';
import { RemoteFileTracker } from '@bitblit/ratchet-common/network/remote-file-tracker/remote-file-tracker';
import { RemoteStatusDataAndContent } from '@bitblit/ratchet-common/lib/network/remote-file-tracker/remote-status-data-and-content';

let mockS3Ratchet: MockProxy<S3CacheRatchetLike>;

describe('#S3RemoteFileTrackingProvider', () => {
  beforeEach(() => {
    mockS3Ratchet = mock<S3CacheRatchetLike>();
    mockS3Ratchet.getDefaultBucket.mockReturnValue('TEST-BUCKET');
  });

  test.skip('Should save/load files', async () => {
    AwsCredentialsRatchet.applySetProfileEnvironmentalVariable('erigir');
    const ratchet: S3CacheRatchetLike = new S3CacheRatchet(new S3Client({ region: 'us-east-1' }), 'erigir-backup');
    // setup initial state
    await ratchet.writeStringToCacheFile('test.txt', 'This is a test ' + new Date().toISOString());

    const testOpts: S3RemoteFileTrackingProviderOptions = {
      //s3CacheRatchet: mockS3Ratchet
      s3CacheRatchet: ratchet,
    };

    const svc: S3RemoteFileTrackingProvider = new S3RemoteFileTrackingProvider(testOpts);
    const obj = new RemoteFileTracker<string>({
      key: 'test.txt',
      provider: svc,
    });

    expect(obj.remoteStatusData).toBeNull;
    await obj.sync();
    expect(obj.remoteStatusData).not.toBeNull;

    const changed1: boolean = await obj.modifiedSinceLastSync();
    expect(changed1).toEqual(false);

    await ratchet.writeStringToCacheFile('test.txt', 'This is a test ' + new Date().toISOString());

    const changed2: boolean = await obj.modifiedSinceLastSync();
    expect(changed2).toEqual(true);

    const raw: RemoteStatusDataAndContent<string> = await obj.pullRemoteData();
    expect(raw).not.toBeNull;
    const data: string = await RemoteFileTracker.dataAsString(raw);
    expect(data).not.toBeNull;

    expect(data.startsWith('This is a test')).toBeTruthy;

    const pushRes: any = await obj.pushStringToRemote('Local-Test', { force: false, backup: true });
    expect(pushRes).not.toBeNull;

    const raw2: RemoteStatusDataAndContent<string> = await obj.pullRemoteData();
    expect(raw2).not.toBeNull;
    const data2: string = await RemoteFileTracker.dataAsString(raw2);
    expect(data2).not.toBeNull;
    expect(data2).toEqual('Local-Test');
  }, 300_000);
});

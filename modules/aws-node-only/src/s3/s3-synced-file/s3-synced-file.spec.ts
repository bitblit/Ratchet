import {
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { Logger, WebStreamRatchet, StringRatchet } from '@bitblit/ratchet-common';
import { mockClient } from 'aws-sdk-client-mock';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { S3SyncedFile } from "./s3-synced-file";
import { AwsCredentialsRatchet, S3CacheRatchet, S3CacheRatchetLike } from "@bitblit/ratchet-aws";
import { S3SyncedFileConfig } from "./s3-synced-file-config";
import { S3SyncedFileConfigInitMode } from "./s3-synced-file-config-init-mode";


describe('#S3SyncedFile', function () {

  beforeEach(() => {
  });

  test('should sync on it', async () => {
    AwsCredentialsRatchet.applySetProfileEnvironmentalVariable('erigir');
    const s3: S3CacheRatchet = new S3CacheRatchet(new S3Client({ region: 'us-east-1' }), 'bella-lingua-data');

    const cfg: S3SyncedFileConfig = {
      s3CacheRatchetLike: s3,
      s3Path: 'synctest/test.txt',
      forceLocalFileFullPath: 'localtest.txt',
      initMode: S3SyncedFileConfigInitMode.OnStartup,
      leaveOnDisk: false
    };
    const test: S3SyncedFile = new S3SyncedFile(cfg);

    Logger.info('Updated: %s', await test.remoteUpdatedEpochMS);
    Logger.info('Local size: %s Remote Size %s', test.localFileBytes, await test.remoteSizeInBytes);

    test.directWriteValueToLocalFile('12345 : '+new Date());
    await test.sendLocalToRemote();
    Logger.info('Local size: %s Remote Size %s', test.localFileBytes, await test.remoteSizeInBytes);
  });
});

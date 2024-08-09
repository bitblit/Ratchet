import { S3Client } from "@aws-sdk/client-s3";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { beforeEach, describe, test } from "vitest";
import { S3SyncedFile } from "./s3-synced-file.js";
import { AwsCredentialsRatchet } from "@bitblit/ratchet-aws/iam/aws-credentials-ratchet";
import { S3CacheRatchet } from "@bitblit/ratchet-aws/s3/s3-cache-ratchet";
import { S3SyncedFileConfig } from "./s3-synced-file-config.js";
import { S3SyncedFileConfigInitMode } from "./s3-synced-file-config-init-mode.js";
import { RemoteStatusData } from "@bitblit/ratchet-common/network/remote-file-sync/remote-status-data";


describe('#S3SyncedFile', function () {

  beforeEach(() => {
  });

  test.skip('should sync on it', async () => {
    AwsCredentialsRatchet.applySetProfileEnvironmentalVariable('erigir');
    const s3: S3CacheRatchet = new S3CacheRatchet(new S3Client({ region: 'us-east-1' }), 'bella-lingua-data');

    const cfg: S3SyncedFileConfig = {
      s3CacheRatchetLike: s3,
      s3Path: 'synctest/test.txt',
      forceLocalFileFullPath: 'localtest.txt',
      initMode: S3SyncedFileConfigInitMode.OnStartup,
      leaveTempFileOnDisk: false
    };
    const test: S3SyncedFile = new S3SyncedFile(cfg);

    let remote: RemoteStatusData = await test.remoteStatusData;

    Logger.info('Local size: %s Remote %j', test.localFileBytes, remote);

    test.directWriteValueToLocalFile('12345 : '+new Date());
    await test.sendLocalToRemote();
    remote = await test.remoteStatusData;
    Logger.info('Local size: %s Remote Size %s', test.localFileBytes, remote);
  });
});

import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { StopWatch } from "@bitblit/ratchet-common/lang/stop-watch";
import {
  CompleteMultipartUploadCommandOutput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommandOutput
} from "@aws-sdk/client-s3";
import { DateTime } from "luxon";
import {
  RemoteFileTrackingProvider
} from "@bitblit/ratchet-common/network/remote-file-tracker/remote-file-tracking-provider";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { RemoteStatusData } from "@bitblit/ratchet-common/network/remote-file-tracker/remote-status-data";
import { S3RemoteFileTrackingProviderOptions } from "./s3-remote-file-tracking-provider-options.js";
import {
  RemoteStatusDataAndContent
} from "@bitblit/ratchet-common/network/remote-file-tracker/remote-status-data-and-content";
import { FileTransferResult } from "@bitblit/ratchet-common/network/remote-file-tracker/file-transfer-result";
import { BackupResult } from "@bitblit/ratchet-common/network/remote-file-tracker/backup-result";
import {
  RemoteFileTrackerPushOptions
} from "@bitblit/ratchet-common/network/remote-file-tracker/remote-file-tracker-push-options";
import { RemoteFileTracker } from "@bitblit/ratchet-common/network/remote-file-tracker/remote-file-tracker";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { FileTransferResultType } from "@bitblit/ratchet-common/network/remote-file-tracker/file-transfer-result-type";

// Keeps a local file up-to-date with a file on S3
export class S3RemoteFileTrackingProvider implements RemoteFileTrackingProvider<string> {

  constructor(private opts: S3RemoteFileTrackingProviderOptions) {
    RequireRatchet.notNullOrUndefined(opts, 'opts');
    RequireRatchet.notNullOrUndefined(opts.s3CacheRatchet, 'opts.s3CacheRatchet');
    RequireRatchet.notNullOrUndefined(opts.s3CacheRatchet.getDefaultBucket(), 'opts.s3CacheRatchet must have default bucket set');
  }

  public async readRemoteStatus(key: string): Promise<RemoteStatusData<string>> {
    let rval: RemoteStatusData<string> = null;
    if (StringRatchet.trimToNull(key)) {
      const meta: HeadObjectCommandOutput = await this.opts.s3CacheRatchet.fetchMetaForCacheFile(key);
      if (meta) {
        rval = {
          key: key,
          statusTakenEpochMs: Date.now(),
          remoteSizeInBytes: meta.ContentLength,
          remoteLastUpdatedEpochMs: meta.LastModified.getTime(),
          remoteHash: meta.ETag,
        };
      }
    }
    return rval;
  }

  public async pullRemoteData(key: string, ifNewerThan?: RemoteStatusData<string>): Promise<RemoteStatusDataAndContent<string>> {
    let rval: RemoteStatusDataAndContent<string> = null;
      const sw: StopWatch = new StopWatch();

        const req: GetObjectCommandInput = {
          Bucket: this.opts.s3CacheRatchet.getDefaultBucket(),
          Key: key,
          IfModifiedSince: ifNewerThan?.remoteLastUpdatedEpochMs ? new Date(ifNewerThan.remoteLastUpdatedEpochMs):null,
        };

        const output: GetObjectCommandOutput = await this.opts.s3CacheRatchet.fetchCacheFilePassThru(req);
        if (output) {
          rval = {
            status: {
              key: key,
              statusTakenEpochMs: Date.now(),
              remoteSizeInBytes: output.ContentLength,
              remoteLastUpdatedEpochMs: output.LastModified.getTime(),
              remoteHash: output.ETag,
            },
            content: output.Body.transformToWebStream()
          }
          Logger.info('Fetched remote to local, %d bytes in %s : %s', output.ContentLength, sw.dump(), key);
        } else {
          Logger.info('Did not pull %s - not modified', key);
        }

        return rval;
    }

  public async sendDataToRemote(src: ReadableStream, key: string, opts: RemoteFileTrackerPushOptions, checkStatus: RemoteStatusData<string>): Promise<FileTransferResult> {
    RequireRatchet.notNullOrUndefined(src, 'src');
    RequireRatchet.notNullOrUndefined(key, 'key');
    RequireRatchet.notNullOrUndefined(opts, 'opts');
    let rval: FileTransferResult = {
      type: null,
      error: null,
      bytesTransferred: null,
      backupResult: BackupResult.NotRequested
    };

    const sw: StopWatch = new StopWatch();
    Logger.info('Sending local data to remote : %s : %j : %j', key, opts, checkStatus);

    // Check it was not modified
    // TODO: should be able to wrap this into the PUT request probably?
    if (!opts.force && checkStatus?.remoteLastUpdatedEpochMs) {
      sw.start('statusCheck');
      const current: RemoteStatusData<string> = await this.readRemoteStatus(key);
      if (!RemoteFileTracker.statusMatch(checkStatus, current)) {
        rval.type = FileTransferResultType.Error;
        rval.error = 'CheckStatus did not match, was '+JSON.stringify(checkStatus) + ' but current is '+JSON.stringify(current) + ' and force not specified';
        rval.bytesTransferred= 0;
        return rval; // TODO: Refactor for single exit point
      }
      sw.stop('statusCheck');
      Logger.info('Performed status check in %s', sw.dump('statusCheck'));
    }

    // Backup if requested
    if (opts.backup) {
      sw.start('backup');
      rval.backupResult = await this.backupRemote(key);
      sw.stop('backup');
      Logger.info('Performed backup in %s', sw.dump('backup'));
    }

    // Write the file
    try {
      sw.start('send');
      const out: CompleteMultipartUploadCommandOutput = await this.opts.s3CacheRatchet.writeStreamToCacheFile(
        key,
        src);
      sw.stop('send');
      Logger.info('Sent to remote in %s : %j', sw.dump('send'), out);
    } catch (err) {
      Logger.error('Failed to write %s - %s', key, err, err);
      rval.type = FileTransferResultType.Error;
      rval.error = ErrorRatchet.safeStringifyErr(err);
      rval.bytesTransferred = 0;
    }
    Logger.info('Overall timing : %s', sw.dump());
    return rval;
  }

  public async backupRemote(key: string): Promise<BackupResult> {
    let rval: BackupResult = null;
    try {
      const lastSlash: number = key.lastIndexOf('/');
      const datePart: string = '/backup/' + DateTime.now().toFormat('yyyy/MM/dd/HH/mm/ss') + '/';
      const newPath: string =
        lastSlash > -1
          ? key.substring(0, lastSlash) + datePart + key.substring(lastSlash + 1)
          : datePart + key;

      Logger.info('Backing up path %s to %s', key, newPath);
      await this.opts.s3CacheRatchet.copyFile(key, newPath);
      rval = BackupResult.Success;
    } catch (err) {
      Logger.error('Failed to backup %s : %s', key, err, err);
      rval = BackupResult.Error;
    }
    return rval;
  }

}

import { FileTransferResult, Logger, RemoteFileSyncLike, RequireRatchet, StopWatch } from "@bitblit/ratchet-common";
import tmp from 'tmp';
import fs, { WriteStream } from 'fs';
import { S3CacheRatchet, S3CacheRatchetLike } from "@bitblit/ratchet-aws";
import {
  CompleteMultipartUploadCommandOutput,
  CopyObjectCommand,
  CopyObjectCommandInput,
  CopyObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandInput,
  ListObjectsCommandOutput,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  NoSuchKey,
  NotFound,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from "stream";
import { S3SyncedFileConfig } from "./s3-synced-file-config";
import { S3SyncedFileConfigInitMode } from "./s3-synced-file-config-init-mode";
// Keeps a local file up-to-date with a file on S3
export class S3SyncedFile implements RemoteFileSyncLike{
  private readonly _localFileName: string;

  private _lastSyncEpochMS: number;
  private _remoteModifiedAtLastSyncEpochMS: number;

  private _loadingRemoteSignal: Promise<FileTransferResult>;

  constructor(private config: S3SyncedFileConfig) {
    RequireRatchet.notNullOrUndefined(config, 'config');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(config.s3Path, 's3Path');
    RequireRatchet.notNullOrUndefined(config.s3CacheRatchetLike, 's3CacheRatchetLike');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(config.s3CacheRatchetLike.getDefaultBucket(), 's3CacheRatchetLike.getDefaultBucket()');

    if (config.forceLocalFileFullPath) {
      this._localFileName = config.forceLocalFileFullPath;
    } else {
      const extension: string = config.s3Path.includes('.') ? config.s3Path.substring(config.s3Path.lastIndexOf('.')+1) : undefined;
      this._localFileName = config.forceLocalFileFullPath ?? tmp.fileSync({ postfix: extension, keep: config.leaveOnDisk }).name;
    }
    Logger.info('Using local path %s to sync %s / %s', this._localFileName, config.s3CacheRatchetLike.getDefaultBucket(), this.config.s3Path);
    if (config.initMode === S3SyncedFileConfigInitMode.OnStartup) {
      Logger.info('Initial loading');
      this.fetchRemoteToLocal().then(()=>{Logger.info('Finished initial load')});
    }
  }

  public directWriteValueToLocalFile(value: string|Uint8Array): void {
    RequireRatchet.notNullOrUndefined(value, 'value');
    fs.writeFileSync(this._localFileName, value);
  }

  public get lastSyncEpochMS(): number {
    return this._lastSyncEpochMS;
  }
  public get remoteModifiedAtLastSyncEpochMS(): number {
    return this._remoteModifiedAtLastSyncEpochMS;
  }

  public get localFileName(): string {
    return this._localFileName;
  }

  public get localFileStats(): fs.Stats {
    let rval: fs.Stats = null;
    if (fs.existsSync(this._localFileName)) {
      const stat: fs.Stats = fs.statSync(this._localFileName);
      rval = stat;
    }
    return rval;
  }

  public get localFileBytes(): number {
    const st: fs.Stats = this.localFileStats;
    return st ? st.size : null;
  }

  public get localFileUpdatedEpochMS(): number {
    const st: fs.Stats = this.localFileStats;
    return st ? st.mtime.getTime() : null;
  }

  public async fetchRemoteMeta(): Promise<HeadObjectCommandOutput> {
    return this.config.s3CacheRatchetLike.fetchMetaForCacheFile(this.config.s3Path);
  }

  public get remoteUpdatedEpochMS(): Promise<number> {
    return (async ()=>{
      const output: HeadObjectCommandOutput = await this.fetchRemoteMeta();
      return output ? output.LastModified.getTime() : null;
    })();
  }

  public get remoteSizeInBytes(): Promise<number> {
    return (async()=>{
    const output: HeadObjectCommandOutput = await this.fetchRemoteMeta();
    return output ? output.ContentLength : null;})();
  }

  public async sendLocalToRemote(): Promise<FileTransferResult> {
    let rval: FileTransferResult = null;
    const sw: StopWatch = new StopWatch();
    try {
      const out: CompleteMultipartUploadCommandOutput = await this.config.s3CacheRatchetLike.writeStreamToCacheFile(this.config.s3Path, fs.readFileSync(this._localFileName));
      rval = FileTransferResult.Updated;
    } catch (err) {
      Logger.error('Failed to transfer %s : %s', this._localFileName, err, err);
      rval = FileTransferResult.Error;
    }
    Logger.info('Sent %d bytes to remote in %s', this.localFileBytes, sw.dump())
    return rval;
  }

  public async fetchRemoteToLocal(): Promise<FileTransferResult> {
    return this.fetchRemoteToLocalIfNewerThan(0);
  }

  public async fetchRemoteToLocalIfNewerThan(epochMS: number): Promise<FileTransferResult> {
    if (!this._loadingRemoteSignal) {
      this._loadingRemoteSignal = this.innerFetchRemoteToLocalIfNewerThan(epochMS);
    }
    return this._loadingRemoteSignal;
  }

  private async innerFetchRemoteToLocalIfNewerThan(epochMS: number): Promise<FileTransferResult> {
    try {
      const sw: StopWatch = new StopWatch();
      const req: GetObjectCommandInput = {
        Bucket: this.config.s3CacheRatchetLike.getDefaultBucket(),
        Key: this.config.s3Path,
        IfModifiedSince: new Date(epochMS)
      };

      const output: GetObjectCommandOutput = await this.config.s3CacheRatchetLike.fetchCacheFilePassThru(req);
      const fileStream: WriteStream = fs.createWriteStream(this._localFileName);
      const readStream: Readable = output.Body as Readable;
      readStream.pipe(fileStream);
      this._lastSyncEpochMS = Date.now();
      this._remoteModifiedAtLastSyncEpochMS = output.LastModified.getTime();
      Logger.info('Fetched remote to local, %d bytes in %s', output.ContentLength, sw.dump());

      return FileTransferResult.Updated;
    } catch (err) {
      Logger.error('Failed to fetch %s / %s : %s', this.config.s3CacheRatchetLike.getDefaultBucket(), this.config.s3Path, err, err);
      return FileTransferResult.Error;
    }
  }

}

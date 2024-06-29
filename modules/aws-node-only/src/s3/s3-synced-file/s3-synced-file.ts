import {
  BackupResult,
  FileTransferResult,
  Logger, PromiseRatchet,
  RemoteFileSyncLike,
  RequireRatchet,
  StopWatch
} from "@bitblit/ratchet-common";
import tmp from "tmp";
import fs, { WriteStream } from "fs";
import {
  CompleteMultipartUploadCommandOutput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommandOutput
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { S3SyncedFileConfig } from "./s3-synced-file-config";
import { S3SyncedFileConfigInitMode } from "./s3-synced-file-config-init-mode";
import { DateTime } from "luxon";
import { S3SyncedFileRemoteBackupMode } from "./s3-synced-file-remote-backup-mode";
import { S3SyncedFileFetchOptimization } from "./s3-synced-file-fetch-optimization";

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

    this.initialize().then(()=>{
      Logger.info('Initialized');
    })
  }

  private async initialize(): Promise<void> {
    Logger.info('Using local path %s to sync %s / %s', this._localFileName, this.config.s3CacheRatchetLike.getDefaultBucket(), this.config.s3Path);
    if (this.config.initMode === S3SyncedFileConfigInitMode.OnStartup) {
      Logger.info('Initial loading');
      this.fetchRemoteToLocal().then(() => {
        Logger.info('Finished initial load')
      });
    }
  }

  public async localAndRemoteAreSameSize(): Promise<boolean> {
    let rval: boolean = false;
    const localBytes: number = this.localFileBytes;
    if (localBytes!==null) {
      const remoteBytes: number = await this.remoteSizeInBytes;
      rval = localBytes===remoteBytes;
      Logger.info('Local size is %s, remote is %s, same is %s', localBytes, remoteBytes, rval);
    }
    return rval;
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
    Logger.info('Sending local file to remote');
    let rval: FileTransferResult = null;
    const sw: StopWatch = new StopWatch();
    try {
      if (this.config.backupMode===S3SyncedFileRemoteBackupMode.EveryUpload) {
        Logger.info('EveryUpload mode set - backing up');
        const backupRes: BackupResult = await this.backupRemote();
        Logger.info('Backup result : %s',backupRes);
      }
      const out: CompleteMultipartUploadCommandOutput = await this.config.s3CacheRatchetLike.writeStreamToCacheFile(this.config.s3Path, fs.readFileSync(this._localFileName));
      rval = FileTransferResult.Updated;
    } catch (err) {
      Logger.error('Failed to transfer %s : %s', this._localFileName, err, err);
      rval = FileTransferResult.Error;
    }
    Logger.info('Sent %d bytes to remote in %s', this.localFileBytes, sw.dump())
    return rval;
  }

  public async backupRemote(): Promise<BackupResult> {
    let rval: BackupResult = null;
    try{
      const lastSlash: number = this.config.s3Path.lastIndexOf('/');
      const datePart: string = '/backup/'+DateTime.now().toFormat('yyyy/MM/dd/HH/mm/ss')+'/';
      const newPath: string = lastSlash>-1 ? this.config.s3Path.substring(0, lastSlash) + datePart + this.config.s3Path.substring(lastSlash+1) :
        datePart + this.config.s3Path;

      Logger.info('Backing up path %s to %s', this.config.s3Path, newPath);
      await this.config.s3CacheRatchetLike.copyFile(this.config.s3Path, newPath);
      rval = BackupResult.Success;
    } catch(err) {
      Logger.error('Failed to backup %s : %s', this.config.s3Path, err, err);
      rval = BackupResult.Error;
    }
    return rval;
  }

  public async fetchRemoteToLocal(): Promise<FileTransferResult> {
    Logger.info('Called fetchRemoteToLocal');
    return this.fetchRemoteToLocalIfNewerThan(0);
  }

  public async fetchRemoteToLocalIfNewerThan(epochMS: number): Promise<FileTransferResult> {
    if (!this._loadingRemoteSignal) {
      this._loadingRemoteSignal = this.innerFetchRemoteToLocalIfNewerThan(epochMS);
    }
    return this._loadingRemoteSignal;
  }

  private hasFetchOptimization(opt: S3SyncedFileFetchOptimization): boolean {
    const rval: boolean = !!opt && (this?.config?.fetchOptimizations || []).includes(opt);
    Logger.info('hasFetchOptimization %s returning %s', opt, rval);
    return rval;
  }

  private async innerFetchRemoteToLocalIfNewerThan(epochMS: number): Promise<FileTransferResult> {
    try {
      const sw: StopWatch = new StopWatch();

      if (!this.hasFetchOptimization(S3SyncedFileFetchOptimization.TreatSameSizeAsNoChange) || await this.localAndRemoteAreSameSize()) {
        const req: GetObjectCommandInput = {
          Bucket: this.config.s3CacheRatchetLike.getDefaultBucket(),
          Key: this.config.s3Path,
          IfModifiedSince: new Date(epochMS)
        };

        const output: GetObjectCommandOutput = await this.config.s3CacheRatchetLike.fetchCacheFilePassThru(req);
        const fileStream: WriteStream = fs.createWriteStream(this._localFileName);
        const readStream: Readable = output.Body as Readable;
        readStream.pipe(fileStream);
        Logger.info('Waiting for pipe completion');
        await PromiseRatchet.resolveOnEvent(fileStream, ['close','finish'], ['error']);
        Logger.info('Pipe completed');
        this._lastSyncEpochMS = Date.now();
        this._remoteModifiedAtLastSyncEpochMS = output.LastModified.getTime();
        Logger.info('Fetched remote to local, %d bytes in %s', output.ContentLength, sw.dump());
      } else {
        Logger.info('TreatSameSizeAsNoChange enabled and files are same size - skipping');
        this._lastSyncEpochMS = Date.now();
      }
      return FileTransferResult.Updated;
    } catch (err) {
      Logger.error('Failed to fetch %s / %s : %s', this.config.s3CacheRatchetLike.getDefaultBucket(), this.config.s3Path, err, err);
      return FileTransferResult.Error;
    }
  }

}

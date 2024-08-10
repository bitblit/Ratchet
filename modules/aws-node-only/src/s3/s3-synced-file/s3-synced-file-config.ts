import { S3CacheRatchetLike } from '@bitblit/ratchet-aws/s3/s3-cache-ratchet-like';
import { S3SyncedFileConfigInitMode } from './s3-synced-file-config-init-mode.js';
import { S3SyncedFileRemoteBackupMode } from './s3-synced-file-remote-backup-mode.js';
import { S3SyncedFileOptimization } from './s3-synced-file-optimization.js';

export interface S3SyncedFileConfig {
  s3CacheRatchetLike: S3CacheRatchetLike;
  s3Path: string;
  forceLocalFileFullPath?: string;
  initMode: S3SyncedFileConfigInitMode;
  backupMode?: S3SyncedFileRemoteBackupMode;
  fetchOptimizations?: S3SyncedFileOptimization[];
  pushOptimizations?: S3SyncedFileOptimization[];
  remoteStatusTtlMs?: number;
  leaveTempFileOnDisk?: boolean; // If true, do not auto-delete
}

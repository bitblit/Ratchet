import { S3CacheRatchetLike } from "@bitblit/ratchet-aws";
import { S3SyncedFileConfigInitMode } from "./s3-synced-file-config-init-mode.js";
import { S3SyncedFileRemoteBackupMode } from "./s3-synced-file-remote-backup-mode";

export interface S3SyncedFileConfig {
  s3CacheRatchetLike: S3CacheRatchetLike;
  s3Path: string;
  forceLocalFileFullPath?: string;
  initMode: S3SyncedFileConfigInitMode;
  backupMode?: S3SyncedFileRemoteBackupMode;
  leaveOnDisk?: boolean; // If true, do not auto-delete
}

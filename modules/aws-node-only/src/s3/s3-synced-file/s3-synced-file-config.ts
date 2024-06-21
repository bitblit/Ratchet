import { S3CacheRatchetLike } from "@bitblit/ratchet-aws";
import { S3SyncedFileConfigInitMode } from "./s3-synced-file-config-init-mode.js";

export interface S3SyncedFileConfig {
  s3CacheRatchetLike: S3CacheRatchetLike;
  s3Path: string;
  forceLocalFileFullPath?: string;
  initMode: S3SyncedFileConfigInitMode;
  leaveOnDisk?: boolean; // If true, do not auto-delete
}

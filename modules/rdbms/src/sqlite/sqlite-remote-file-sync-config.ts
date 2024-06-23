import { RemoteFileSyncLike } from '@bitblit/ratchet-common';

export interface SqliteRemoteFileSyncConfig {
  remoteFileSync: RemoteFileSyncLike;
  flushRemoteMode?: FlushRemoteMode;
  backupMode?: BackupMode;
}

export enum BackupMode {
  None = 'None',
  Always = 'Always',
  Manual = 'Manual',
}

export enum FlushRemoteMode {
  Auto = 'Auto',
  Explicit = 'Explicit',
}

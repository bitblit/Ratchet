import { SqliteRemoteFileSyncConfig } from './sqlite-remote-file-sync-config.js';

export interface SqliteConnectionConfig {
  label: string;
  filePath?: string;
  remoteFileSync?: SqliteRemoteFileSyncConfig;
}

import { SqliteRemoteFileSyncConfig } from './sqlite-remote-file-sync-config.js';
import { SqliteConnectionConfigFlag } from "./sqlite-connection-config-flag";

export interface SqliteConnectionConfig {
  label: string;
  filePath?: string;
  remoteFileSync?: SqliteRemoteFileSyncConfig;
  flags?: SqliteConnectionConfigFlag[];

}

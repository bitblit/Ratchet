import { SqliteRemoteFileSyncConfig } from './sqlite-remote-file-sync-config.js';
import { SqliteConnectionConfigFlag } from "./sqlite-connection-config-flag";
import { SqliteLocalFileConfig } from "./sqlite-local-file-config";

// If neither localFile nor remoteFileSync are provided, a memory database is used
export interface SqliteConnectionConfig {
  label: string;
  localFile?: SqliteLocalFileConfig;
  remoteFileSync?: SqliteRemoteFileSyncConfig;
  flags?: SqliteConnectionConfigFlag[];
}

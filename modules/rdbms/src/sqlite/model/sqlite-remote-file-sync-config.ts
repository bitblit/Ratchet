import { RemoteFileSyncLike } from '@bitblit/ratchet-common';
import { FlushRemoteMode } from "./flush-remote-mode.js";

export interface SqliteRemoteFileSyncConfig {
  remoteFileSync: RemoteFileSyncLike;
  flushRemoteMode?: FlushRemoteMode;
}

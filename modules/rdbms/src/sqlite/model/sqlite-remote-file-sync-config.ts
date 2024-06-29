import { RemoteFileSyncLike } from '@bitblit/ratchet-common';
import { FlushRemoteMode } from "./flush-remote-mode.js";
import { FetchRemoteMode } from "./fetch-remote-mode";

export interface SqliteRemoteFileSyncConfig {
  remoteFileSync: RemoteFileSyncLike;
  flushRemoteMode?: FlushRemoteMode;
  fetchRemoteMode?: FetchRemoteMode;
}

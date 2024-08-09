import { FlushRemoteMode } from "./flush-remote-mode.js";
import { FetchRemoteMode } from "./fetch-remote-mode.js";
import { RemoteFileSyncLike } from "@bitblit/ratchet-common/network/remote-file-sync/remote-file-sync-like";

export interface SqliteRemoteFileSyncConfig {
  remoteFileSync: RemoteFileSyncLike;
  flushRemoteMode?: FlushRemoteMode;
  fetchRemoteMode?: FetchRemoteMode;
}

import { FlushRemoteMode } from './flush-remote-mode.js';
import { FetchRemoteMode } from './fetch-remote-mode.js';
import { RemoteFileTracker } from '@bitblit/ratchet-common/network/remote-file-tracker/remote-file-tracker';

export interface SqliteRemoteFileSyncConfig {
  remoteFileTracker: RemoteFileTracker<any>;
  flushRemoteMode?: FlushRemoteMode;
  fetchRemoteMode?: FetchRemoteMode;
}

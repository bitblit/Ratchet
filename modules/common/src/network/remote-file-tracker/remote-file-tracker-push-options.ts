export interface RemoteFileTrackerPushOptions {
  force?: boolean; // If set, overwrites the remote file even if out of sync
  backup?: boolean; // If set, the remote file will be backed up before push occurs
}

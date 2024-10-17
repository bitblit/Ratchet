// An interface to define an object that provides remote file sync (and keep syncd)
// capabilities.  Mainly in common so I don't have to import AWS into my sqlite package
// or vice versa

import { RemoteStatusData } from "./remote-status-data.js";
import { RemoteStatusDataAndContent } from "./remote-status-data-and-content.js";
import { FileTransferResult } from "./file-transfer-result.js";
import { RemoteFileTrackerPushOptions } from "./remote-file-tracker-push-options.js";

export interface RemoteFileTrackingProvider<KeyType> {
  readRemoteStatus(key: KeyType): Promise<RemoteStatusData<KeyType>>;
  pullRemoteData(key: KeyType, ifNewerThan?: RemoteStatusData<KeyType>): Promise<RemoteStatusDataAndContent<KeyType>>;
  sendDataToRemote(src: ReadableStream, key: KeyType, opts: RemoteFileTrackerPushOptions, checkStatus: RemoteStatusData<KeyType>): Promise<FileTransferResult>;
}

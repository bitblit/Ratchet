// An interface to define an object that provides remote file sync (and keep syncd)
// capabilities.  Mainly in common so I don't have to import AWS into my sqlite package
// or vice versa

import { FileTransferResult } from "./file-transfer-result.js";
import { BackupResult } from "./backup-result.js";
import { RemoteStatusData } from "./remote-status-data";

export interface RemoteFileSyncLike {
   get lastSyncEpochMS(): number ;
   get localFileName(): string ;
   get localFileBytes(): number ;
   get localFileUpdatedEpochMS(): number ;
   get remoteStatusData(): Promise<RemoteStatusData> ;
   get wouldFetch(): Promise<boolean>; // Returns whether a fetch would occur right now, given optimizations
   get wouldPush(): Promise<boolean>; // Returns whether a fetch would occur right now, given optimizations
   backupRemote(): Promise<BackupResult>;
   sendLocalToRemote(): Promise<FileTransferResult> ;
   fetchRemoteToLocal(): Promise<FileTransferResult> ;
   fetchRemoteToLocalIfNewerThan?(epochMS: number): Promise<FileTransferResult> ;
}


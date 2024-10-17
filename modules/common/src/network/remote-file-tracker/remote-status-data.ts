export interface RemoteStatusData<KeyType> {
  key: KeyType;
  statusTakenEpochMs: number;
  remoteSizeInBytes: number;
  remoteLastUpdatedEpochMs: number;
  remoteHash: string;
}

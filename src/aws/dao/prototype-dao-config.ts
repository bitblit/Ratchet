export interface PrototypeDaoConfig {
  guidCreateFunction: () => string;
  guidFieldName: string;
  createdEpochMSFieldName?: string;
  updatedEpochMSFieldName?: string;
  createdUtcTimestampFieldName?: string;
  updatedUtcTimestampFieldName?: string;
}

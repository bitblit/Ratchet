import { StoredRuntimeParameter } from './stored-runtime-parameter';

export interface CachedStoredRuntimeParameter extends StoredRuntimeParameter {
  storedEpochMS: number;
}

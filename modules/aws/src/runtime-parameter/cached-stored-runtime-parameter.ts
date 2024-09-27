import { StoredRuntimeParameter } from './stored-runtime-parameter.js';

export interface CachedStoredRuntimeParameter extends StoredRuntimeParameter {
  storedEpochMS: number;
}

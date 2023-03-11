/*
  Wraps an object to be stored in the cache along with the cache data needed to store/filter it
*/

export interface SimpleCacheObjectWrapper<T> {
  cacheKey: string;
  createdEpochMS: number;
  expiresEpochMS: number;
  value: T;
  generated: boolean;
}

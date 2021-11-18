/*
  Objects implementing this interface can store and retrieve objects in a cache, using a read-thru
  approach.
*/

import { CacheObjectWrapper } from './cache-object-wrapper';

export interface SimpleCacheStorageProvider {
  // Reads the object from the cache and returns the wrapper.  If the
  readFromCache<T>(cacheKey: string): Promise<CacheObjectWrapper<T>>;
  storeInCache<T>(value: CacheObjectWrapper<T>): Promise<CacheObjectWrapper<T>>;
  removeFromCache(cacheKey: string): Promise<void>;
  clearCache(): Promise<number>;
  readAll(): Promise<CacheObjectWrapper<any>[]>;
}

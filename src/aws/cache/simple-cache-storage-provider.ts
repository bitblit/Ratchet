/*
  Objects implementing this interface can store and retrieve objects in a cache, using a read-thru
  approach.
*/

import { SimpleCacheObjectWrapper } from './simple-cache-object-wrapper';

export interface SimpleCacheStorageProvider {
  // Reads the object from the cache and returns the wrapper.  If the
  readFromCache<T>(cacheKey: string): Promise<SimpleCacheObjectWrapper<T>>;
  storeInCache<T>(value: SimpleCacheObjectWrapper<T>): Promise<boolean>;
  removeFromCache(cacheKey: string): Promise<void>;
  clearCache(): Promise<number>;
  readAll(): Promise<SimpleCacheObjectWrapper<any>[]>;
}

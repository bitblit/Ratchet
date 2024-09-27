/*
  Simple memory-based version, mainly for testing
*/

import { SimpleCacheObjectWrapper } from './simple-cache-object-wrapper.js';
import { SimpleCacheStorageProvider } from './simple-cache-storage-provider.js';

export class MemoryStorageProvider implements SimpleCacheStorageProvider {
  private _cache: Map<string, SimpleCacheObjectWrapper<any>> = new Map<string, SimpleCacheObjectWrapper<any>>();

  public async readFromCache<T>(cacheKey: string): Promise<SimpleCacheObjectWrapper<T>> {
    return this._cache.get(cacheKey);
  }

  public async storeInCache<T>(value: SimpleCacheObjectWrapper<T>): Promise<boolean> {
    let rval: boolean = false;
    if (value?.cacheKey) {
      this._cache.set(value.cacheKey, value);
      rval = true;
    }
    return rval;
  }

  public async removeFromCache(cacheKey: string): Promise<void> {
    if (cacheKey) {
      this._cache.delete(cacheKey);
    }
  }

  public async clearCache(): Promise<number> {
    const rval: number = this._cache.size;
    this._cache = new Map<string, SimpleCacheObjectWrapper<any>>();
    return rval;
  }

  public async readAll(): Promise<SimpleCacheObjectWrapper<any>[]> {
    return Array.from(this._cache.values());
  }
}

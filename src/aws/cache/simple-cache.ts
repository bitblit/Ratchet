/*
  Wraps up a simple cache storage provider and gives helper methods
*/

import { Logger } from '../../common/logger';
import { SimpleCacheStorageProvider } from './simple-cache-storage-provider';
import { CacheObjectWrapper } from './cache-object-wrapper';
import { SimpleCacheReadOptions } from './simple-cache-read-options';

export class SimpleCache {
  // Default 1 minute expiration
  constructor(private provider: SimpleCacheStorageProvider, timeToLiveMS: number = 1_000 * 60) {}

  public static createDefaultReadOptions(timeToLiveMS: number): SimpleCacheReadOptions {
    return {
      maxStalenessMS: null,
      timeToLiveMS: timeToLiveMS,
      cacheNullValues: false,
    };
  }

  public async fetchWrapper<T>(
    cacheKey: string,
    producer: () => Promise<T>,
    opts: SimpleCacheReadOptions = null
  ): Promise<CacheObjectWrapper<T>> {
    Logger.silly('Fetching %s', cacheKey);
    const now: number = new Date().getTime();
    let rval: CacheObjectWrapper<T> = await this.provider.readFromCache(cacheKey);
    if (rval && rval.expiresEpochMS < now) {
      Logger.debug('Object found, but expired - removing');
      rval = null;
    }
    if (rval && opts && opts.maxStalenessMS && now - rval.createdEpochMS > opts.maxStalenessMS) {
      Logger.debug('Object found by too stale - removing');
      rval = null;
    }
    if (!rval) {
      Logger.debug('%s not found in cache, generating');
      const tmp: T = opts?.doNotGenerateOnMissing ? null : await producer();
      if (tmp || opts?.cacheNullValues) {
        Logger.debug('Writing %j to cache');
        const toWrite: CacheObjectWrapper<T> = {
          cacheKey: cacheKey,
          createdEpochMS: now,
          expiresEpochMS: opts && opts.timeToLiveMS ? now + opts.timeToLiveMS : null,
          value: tmp,
        };
        await this.provider.storeInCache(toWrite);
      }
    }
    return rval;
  }

  public async fetch<T>(cacheKey: string, producer: () => Promise<T>, opts: SimpleCacheReadOptions = null): Promise<T> {
    const wrapper: CacheObjectWrapper<T> = await this.fetchWrapper(cacheKey, producer, opts);
    return wrapper ? wrapper.value : null;
  }

  public async removeFromCache<T>(cacheKey: string, returnOldValue?: boolean): Promise<CacheObjectWrapper<T>> {
    let rval: CacheObjectWrapper<T> = null;
    if (returnOldValue) {
      rval = await this.fetchWrapper(cacheKey, () => null);
    }
    await this.provider.removeFromCache(cacheKey);
    return rval;
  }

  public async clearCache(): Promise<number> {
    return this.provider.clearCache();
  }

  public async readAll(): Promise<CacheObjectWrapper<any>[]> {
    return this.provider.readAll();
  }
}

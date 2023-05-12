/*
  Objects implementing this interface can store and retrieve objects in a cache, using a read-thru
  approach.
*/

import { SimpleCacheObjectWrapper } from './simple-cache-object-wrapper.js';
import { SimpleCacheStorageProvider } from './simple-cache-storage-provider.js';
import { S3CacheRatchet } from '../s3/s3-cache-ratchet.js';
import { PutObjectOutput } from '@aws-sdk/client-s3';
import { RequireRatchet } from '@bitblit/ratchet-common';
import { StringRatchet } from '@bitblit/ratchet-common';

export class S3StorageProvider implements SimpleCacheStorageProvider {
  constructor(private s3CacheRatchet: S3CacheRatchet, private prefix: string) {
    RequireRatchet.notNullOrUndefined(this.s3CacheRatchet, 's3CacheRatchet');
    RequireRatchet.notNullOrUndefined(this.s3CacheRatchet.getDefaultBucket(), 's3CacheRatchet.defaultBucket');
  }

  public keyToPath(cacheKey: string): string {
    let rval: string = StringRatchet.trimToEmpty(this.prefix);
    if (rval.length > 0 && !rval.endsWith('/')) {
      rval += '/';
    }
    rval += cacheKey;
    return rval;
  }

  public async readFromCache<T>(cacheKey: string): Promise<SimpleCacheObjectWrapper<T>> {
    const rval: SimpleCacheObjectWrapper<T> = await this.s3CacheRatchet.fetchCacheFileAsObject<SimpleCacheObjectWrapper<T>>(
      this.keyToPath(cacheKey)
    );
    return rval;
  }

  public async storeInCache<T>(value: SimpleCacheObjectWrapper<T>): Promise<boolean> {
    RequireRatchet.notNullOrUndefined(value, 'value');
    RequireRatchet.notNullOrUndefined(value.cacheKey, 'value.cacheKey');
    const tmp: PutObjectOutput = await this.s3CacheRatchet.writeObjectToCacheFile(this.keyToPath(value.cacheKey), value);
    return !!tmp;
  }

  public async removeFromCache(cacheKey: string): Promise<void> {
    await this.s3CacheRatchet.removeCacheFile(this.keyToPath(cacheKey));
  }

  public async clearCache(): Promise<number> {
    const keys: string[] = await this.s3CacheRatchet.directChildrenOfPrefix(this.keyToPath(''));
    const removed: any[] = await Promise.all(keys.map((k) => this.removeFromCache(k)));
    return keys.length;
  }

  public async readAll(): Promise<SimpleCacheObjectWrapper<any>[]> {
    const keys: string[] = await this.s3CacheRatchet.directChildrenOfPrefix(this.keyToPath(''));
    const rval: SimpleCacheObjectWrapper<any>[] = await Promise.all(keys.map((k) => this.readFromCache(k)));
    return rval;
  }
}

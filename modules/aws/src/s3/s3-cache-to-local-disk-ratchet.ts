import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Logger } from '@bitblit/ratchet-common/dist/logger/logger.js';
import { RequireRatchet } from '@bitblit/ratchet-common/dist/lang/require-ratchet.js';
import { StringRatchet } from '@bitblit/ratchet-common/dist/lang/string-ratchet.js';
import { S3CacheRatchet } from './s3-cache-ratchet.js';

/**
 * Use this when you want a lambda to cache a remote S3 bucket locally on disk for faster access
 */
export class S3CacheToLocalDiskRatchet {
  private static readonly DEFAULT_CACHE_TIMEOUT_SEC = 7 * 24 * 3600;

  private currentlyLoading: Map<string, Promise<Buffer>> = new Map<string, Promise<Buffer>>();

  constructor(
    private s3: S3CacheRatchet,
    private tmpFolder: string,
    private cacheTimeoutSeconds: number = S3CacheToLocalDiskRatchet.DEFAULT_CACHE_TIMEOUT_SEC
  ) {
    RequireRatchet.notNullOrUndefined(s3, 's3');
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(tmpFolder));
    RequireRatchet.true(fs.existsSync(tmpFolder), 'folder must exist : ' + tmpFolder);
  }

  public async getFileString(key: string): Promise<string> {
    const buf: Buffer = await this.getFileBuffer(key);
    return buf ? buf.toString() : null;
  }

  private keyToLocalCachePath(key: string): string {
    const cachedHash: string = this.generateCacheHash(this.s3.getDefaultBucket() + '/' + key);
    const rval: string = path.join(this.tmpFolder, cachedHash);
    return rval;
  }

  public removeCacheFileForKey(key: string): void {
    const localCachePath = this.keyToLocalCachePath(key);
    Logger.info('Removing cache file for %s : %s', key, localCachePath);
    if (fs.existsSync(localCachePath)) {
      fs.unlinkSync(localCachePath);
    } else {
      Logger.debug('Skipping delete for %s - does not exist', localCachePath);
    }
  }

  public async getFileBuffer(key: string): Promise<Buffer> {
    const localCachePath: string = this.keyToLocalCachePath(key);

    let rval: Buffer = null;
    rval = this.getCacheFileAsBuffer(localCachePath);

    if (!rval) {
      Logger.info('No cache. Downloading File s3://%s/%s to %s', this.s3.getDefaultBucket(), key, localCachePath);
      try {
        let prom: Promise<Buffer> = this.currentlyLoading.get(key);
        if (prom) {
          Logger.info('Already running - wait for that');
        } else {
          Logger.info('Not running - start');
          prom = this.updateLocalCacheFile(key, localCachePath);
          this.currentlyLoading.set(key, prom);
        }
        rval = await prom;
        this.currentlyLoading.delete(key); // Clear the cache
      } catch (err) {
        Logger.warn('File %s/%s does not exist. Err code: %s', this.s3.getDefaultBucket(), key, err);
      }
    } else {
      Logger.info('Found cache file for s3://%s/%s. Local path %s', this.s3.getDefaultBucket(), key, localCachePath);
    }
    return rval;
  }

  private async updateLocalCacheFile(key: string, localCachePath: string): Promise<Buffer> {
    const rval: Buffer = await this.s3.fetchCacheFileAsBuffer(key);
    if (rval && rval.length > 0) {
      Logger.info('Saving %d bytes to disk for cache', rval.length);
      fs.writeFileSync(localCachePath, rval);
    }
    return rval;
  }

  public getCacheFileAsString(filePath: string): string {
    const buf: Buffer = this.getCacheFileAsBuffer(filePath);
    return buf ? buf.toString() : null;
  }

  public getCacheFileAsBuffer(filePath: string): Buffer {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const stats = fs.statSync(filePath);
      const now = new Date().getTime();

      const duration: number = (now - stats.ctimeMs) / 1000;
      if (duration >= this.cacheTimeoutSeconds) {
        return null;
      } else {
        const rval: Buffer = fs.readFileSync(filePath);
        return rval;
      }
    } catch (err) {
      Logger.warn('Error getting s3 cache file %s', err);
    }

    return null;
  }

  private generateCacheHash(hashVal: string): string {
    const rval: string = crypto.createHash('md5').update(hashVal).digest('hex');

    return rval;
  }
}

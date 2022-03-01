import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Logger, RequireRatchet, StringRatchet } from '../common';
import { S3CacheRatchet } from './s3-cache-ratchet';

/**
 * Use this when you want a lambda to cache a remote S3 bucket locally on disk for faster access
 */
export class S3CacheToLocalDiskRatchet {
  private static readonly DEFAULT_CACHE_TIMEOUT_SEC = 7 * 24 * 3600;

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

  public async getFileBuffer(key: string): Promise<Buffer> {
    const cachedHash: string = this.generateCacheHash(this.s3.getDefaultBucket() + '/' + key);

    let rval: Buffer = null;
    rval = this.getCacheFileAsBuffer(path.join(this.tmpFolder, cachedHash));

    if (!rval) {
      Logger.info('No cache. Downloading File s3://%s/%s to %s', this.s3.getDefaultBucket(), key, this.tmpFolder);
      try {
        const res: Buffer = await this.s3.readCacheFileToBuffer(key);
        if (res && res.length > 0) {
          fs.writeFileSync(path.join(this.tmpFolder, cachedHash), res);
        }
      } catch (err) {
        Logger.warn('File %s/%s does not exist. Err code: %s', this.s3.getDefaultBucket(), key, err);
      }
    } else {
      Logger.info('Found cache file for s3://%s/%s. Cache hash %s', this.s3.getDefaultBucket(), key, cachedHash);
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

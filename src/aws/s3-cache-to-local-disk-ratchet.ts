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

  public async getFileBuffer(key: string, bucket: string): Promise<string> {
    const cachedHash: string = this.generateCacheHash(`${bucket}/${key}`);

    let rval: string = null;
    rval = this.getCacheFile(path.join(this.tmpFolder, cachedHash));

    if (!rval) {
      Logger.info('No cache. Downloading File s3://%s/%s to %s', bucket, key, this.tmpFolder);
      try {
        const res: string = await this.s3.readCacheFileToString(key);

        if (StringRatchet.trimToNull(res)) {
          fs.writeFileSync(path.join(this.tmpFolder, cachedHash), res);
        }
      } catch (err) {
        Logger.warn('File %s/%s does not exist. Err code: %s', bucket, key, err);
      }
    } else {
      Logger.info('Found cache file for s3://%s/%s. Cache hash %s', bucket, key, cachedHash);
    }
    return rval;
  }

  public getCacheFile(filePath: string): string {
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
        const rval: string = fs.readFileSync(filePath).toString();
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

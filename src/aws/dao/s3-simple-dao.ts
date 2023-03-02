/*
    Wrap S3 with an ability to store and retrieve objects cached as json files
*/

import { Logger } from '../../common/logger';
import { S3CacheRatchet } from '../s3/s3-cache-ratchet';
import { SimpleDaoItem } from './simple-dao-item';
import { DeleteObjectOutput, PutObjectOutput } from '@aws-sdk/client-s3';
import { StringRatchet } from '../../common/string-ratchet';

export class S3SimpleDao<T extends SimpleDaoItem> {
  constructor(private cache: S3CacheRatchet, private prefix?: string) {
    if (!cache) {
      throw new Error('cache object may not be null');
    }
    if (!cache.getDefaultBucket()) {
      throw new Error('Supplied cache must have default bucket set');
    }
  }

  public buildPathPrefix(path: string): string {
    let rval: string = '';
    if (this.prefix) {
      rval += this.prefix;
    }
    if (path) {
      rval += path;
    }
    return rval;
  }

  public buildFullPath(id: string, path?: string): string {
    let rval: string = this.buildPathPrefix(path);
    if (rval.length > 0) {
      rval += '/';
    }
    rval += id + '.json';
    return rval;
  }

  public async exists(id: string, path?: string): Promise<boolean> {
    const fullPath: string = this.buildFullPath(id, path);
    Logger.debug('Check file existence : %s', fullPath);
    return this.cache.fileExists(fullPath);
  }

  public async fetch(id: string, path?: string): Promise<T> {
    const fullPath: string = this.buildFullPath(id, path);
    Logger.debug('Fetching : %s', fullPath);
    const rval: T = (await this.cache.fetchCacheFileAsObject(fullPath)) as T;
    // Force-set id and path
    rval.id = id;
    rval.path = path;
    return rval;
  }

  public async store(item: T, path?: string): Promise<T> {
    item.id = item.id || StringRatchet.createType4Guid();
    item.lastModifiedEpochMS = new Date().getTime();

    const fullPath: string = this.buildFullPath(item.id, path);
    Logger.debug('Storing : %s', fullPath);

    const stored: PutObjectOutput = await this.cache.writeObjectToCacheFile(fullPath, item);
    const read: T = await this.fetch(item.id, path);
    return read;
  }

  public async listItems(path?: string): Promise<string[]> {
    const fullPath: string = this.buildPathPrefix(path);
    Logger.debug('Listing : %s', fullPath);

    const rval: string[] = await this.cache.directChildrenOfPrefix(fullPath);
    return rval;
  }

  public async fetchItemsInPath(path?: string): Promise<T[]> {
    const fullPath: string = this.buildPathPrefix(path);
    Logger.debug('Full fetch of : %s', fullPath);
    const items: string[] = await this.listItems(path);
    const promises: Promise<T>[] = items.map((s) => this.fetch(s, path));
    const rval: T[] = await Promise.all(promises);
    return rval;
  }

  public async delete(id: string, path?: string): Promise<boolean> {
    const fullPath: string = this.buildFullPath(id, path);
    Logger.debug('Deleting : %s', fullPath);

    const del: DeleteObjectOutput = await this.cache.removeCacheFile(fullPath);
    return del != null;
  }
}

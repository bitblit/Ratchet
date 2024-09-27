import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { PutObjectOutput } from '@aws-sdk/client-s3';
import { PrototypeDaoProvider } from '../../dao/prototype-dao-provider.js';
import { PrototypeDaoDb } from '../../dao/prototype-dao-db.js';
import { S3CacheRatchetLike } from '../s3-cache-ratchet-like.js';

/* An implementation that puts all the values in a single JSON file in S3
  This won't scale well at all for any kind of serious load, but is the easiest
  solution for a very low traffic website since it doesn't require setting up tables,
  provisioning, etc
 */
export class S3PrototypeDaoProvider<T> implements PrototypeDaoProvider<T> {
  constructor(
    private s3CacheRatchet: S3CacheRatchetLike,
    private keyName: string,
  ) {
    RequireRatchet.notNullOrUndefined(s3CacheRatchet, 's3CacheRatchet');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(s3CacheRatchet.getDefaultBucket(), 's3CacheRatchet.defaultBucket');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(keyName, 'keyName');
  }

  public async storeDatabase(inDb: PrototypeDaoDb<T>): Promise<boolean> {
    const toSave: PrototypeDaoDb<T> = inDb || { items: [], lastModifiedEpochMS: null };
    toSave.lastModifiedEpochMS = Date.now();
    const put: PutObjectOutput = await this.s3CacheRatchet.writeObjectToCacheFile(this.keyName, toSave);
    const rval: boolean = !!put;
    return rval;
  }

  public async loadDatabase(): Promise<PrototypeDaoDb<T>> {
    const rval: PrototypeDaoDb<T> = (await this.s3CacheRatchet.fetchCacheFileAsObject<PrototypeDaoDb<any>>(this.keyName)) || {
      items: [],
      lastModifiedEpochMS: Date.now(),
    };
    return rval;
  }
}

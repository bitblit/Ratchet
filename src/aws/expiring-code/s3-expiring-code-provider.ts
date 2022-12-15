import { ExpiringCodeProvider } from './expiring-code-provider';
import { ExpiringCode } from './expiring-code';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { S3CacheRatchet } from '../s3-cache-ratchet';
import { Logger, RequireRatchet } from '../../common';
import { PutObjectOutput } from 'aws-sdk/clients/s3';

/* An implementation that puts all the values in a single JSON file in S3
  This won't scale well at all for any kind of serious load, but is the easiest
  solution for a very low traffic website since it doesn't require setting up tables,
  provisioning, etc
 */
export class S3ExpiringCodeProvider implements ExpiringCodeProvider {
  constructor(private s3CacheRatchet: S3CacheRatchet, private keyName: string) {
    RequireRatchet.notNullOrUndefined(s3CacheRatchet, 's3CacheRatchet');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(s3CacheRatchet.getDefaultBucket(), 's3CacheRatchet.defaultBucket');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(keyName, 'keyName');
  }

  public async fetchFile(): Promise<S3ExpiringCodeProviderFileWrapper> {
    const rval: S3ExpiringCodeProviderFileWrapper = (await this.s3CacheRatchet.readCacheFileToObject<S3ExpiringCodeProviderFileWrapper>(
      this.keyName
    )) || {
      data: [],
      lastModifiedEpochMS: Date.now(),
    };
    return rval;
  }

  public async updateFile(vals: ExpiringCode[]): Promise<PutObjectOutput> {
    const next: S3ExpiringCodeProviderFileWrapper = {
      data: vals || [],
      lastModifiedEpochMS: Date.now(),
    };
    next.data = next.data.filter((d) => d.expiresEpochMS > Date.now()); // Always strip out expired codes
    Logger.info('Updating code file to %s codes', next.data.length);
    const rval: PutObjectOutput = await this.s3CacheRatchet.writeObjectToCacheFile(this.keyName, next);
    return rval;
  }

  public async checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean> {
    const val: S3ExpiringCodeProviderFileWrapper = await this.fetchFile();
    const rval: ExpiringCode = val.data.find(
      (d) => d?.code?.toUpperCase() === code?.toUpperCase() && d?.context?.toUpperCase() === context?.toUpperCase()
    );
    if (rval) {
      if (deleteOnMatch || rval.expiresEpochMS < Date.now()) {
        Logger.info('Stripping used/expired code from the database');
        const newData: ExpiringCode[] = val.data.filter((d) => d != rval);
        await this.updateFile(newData);
      }
    }

    return !!rval && rval.expiresEpochMS > Date.now();
  }

  public async storeCode(code: ExpiringCode): Promise<boolean> {
    const old: S3ExpiringCodeProviderFileWrapper = await this.fetchFile();
    old.data.push(code);
    const wrote: PutObjectOutput = await this.updateFile(old.data);
    return !!wrote;
  }
}

export interface S3ExpiringCodeProviderFileWrapper {
  data: ExpiringCode[];
  lastModifiedEpochMS: number;
}

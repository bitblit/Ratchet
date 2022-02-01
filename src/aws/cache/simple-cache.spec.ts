import AWS from 'aws-sdk';
import {S3StorageProvider} from './s3-storage-provider';
import {SimpleCache} from './simple-cache';
import {S3CacheRatchet} from '../s3-cache-ratchet';
import {SimpleCacheObjectWrapper} from './simple-cache-object-wrapper';
import {DynamoRatchet} from '../dynamo-ratchet';
import {DynamoDbSimpleCacheOptions, DynamoDbStorageProvider} from './dynamo-db-storage-provider';

describe('#simpleCache', function () {
  xit('should read/write/delete with an S3 handler', async () => {
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const s3StorageProvider: S3StorageProvider = new S3StorageProvider(cache, 'test-cache');

    const simpleCache: SimpleCache = new SimpleCache(s3StorageProvider, 2000000);

    await simpleCache.removeFromCache('test1'); // Make sure clear

    const test1a: SimpleCacheObjectWrapper<any> = await simpleCache.fetchWrapper<any>('test1', () => Promise.resolve({ x: 1 }));
    expect(test1a).not.toBeNull();
    expect(test1a.generated).toBeTruthy();
    expect(test1a.value).not.toBeNull();
    expect(test1a.value['x']).toEqual(1);

    const test1b: SimpleCacheObjectWrapper<any> = await simpleCache.fetchWrapper<any>('test1', () => Promise.resolve({ x: 1 }));
    expect(test1b).not.toBeNull();
    expect(test1b.generated).toBeFalsy();
    expect(test1b.value).not.toBeNull();
    expect(test1b.value['x']).toEqual(1);

    await simpleCache.removeFromCache('test1'); // Make sure clear
  }, 60_000);

  xit('should read/write/delete with an dynamo handler', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));
    const opts: DynamoDbSimpleCacheOptions = DynamoDbStorageProvider.createDefaultOptions();
    opts.tableName = 'test-table';
    opts.useRangeKeys = false;
    opts.hashKeyName = 'cacheUid';
    opts.dynamoExpiresColumnName = 'expiresEpochSeconds';

    const ddbStorage: DynamoDbStorageProvider = new DynamoDbStorageProvider(dr, opts);

    const simpleCache: SimpleCache = new SimpleCache(ddbStorage, 2000000);

    await simpleCache.removeFromCache('test1'); // Make sure clear

    const test1a: SimpleCacheObjectWrapper<any> = await simpleCache.fetchWrapper<any>('test1', () => Promise.resolve({ x: 1 }));
    expect(test1a).not.toBeNull();
    expect(test1a.generated).toBeTruthy();
    expect(test1a.value).not.toBeNull();
    expect(test1a.value['x']).toEqual(1);

    const test1b: SimpleCacheObjectWrapper<any> = await simpleCache.fetchWrapper<any>('test1', () => Promise.resolve({ x: 1 }));
    expect(test1b).not.toBeNull();
    expect(test1b.generated).toBeFalsy();
    expect(test1b.value).not.toBeNull();
    expect(test1b.value['x']).toEqual(1);

    await simpleCache.removeFromCache('test1'); // Make sure clear
  }, 60_000);

  xit('should write a bunch', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' }));
    const opts: DynamoDbSimpleCacheOptions = DynamoDbStorageProvider.createDefaultOptions();
    opts.tableName = 'test-table';
    opts.useRangeKeys = false;
    opts.hashKeyName = 'cacheUid';
    opts.dynamoExpiresColumnName = 'expiresEpochSeconds';

    const ddbStorage: DynamoDbStorageProvider = new DynamoDbStorageProvider(dr, opts);
    const simpleCache: SimpleCache = new SimpleCache(ddbStorage, 1000);

    for (let i = 0; i < 10; i++) {
      const tests: SimpleCacheObjectWrapper<any> = await simpleCache.fetchWrapper<any>('test' + i, () => Promise.resolve({ x: i }));
    }

    const all: SimpleCacheObjectWrapper<any>[] = await simpleCache.readAll();
    expect(all).not.toBeNull();
    expect(all.length).toBeGreaterThan(9);
    await simpleCache.clearCache();
  }, 60_000);
});

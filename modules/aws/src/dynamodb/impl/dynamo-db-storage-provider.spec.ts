import { DynamoDbSimpleCacheOptions, DynamoDbStorageProvider } from "./dynamo-db-storage-provider.js";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {DynamoRatchet} from "../dynamo-ratchet.js";
import {SimpleCache} from "../../cache/simple-cache.js";
import {SimpleCacheObjectWrapper} from "../../cache/simple-cache-object-wrapper.js";

import { describe, expect, test } from "vitest";

describe('#DynamoDbStorageProvider', function () {

  test.skip('should read/write/delete with an dynamo handler', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(DynamoDBDocument.from(new DynamoDBClient({ region: 'us-east-1' })));
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

  test.skip('should write a bunch', async () => {
    const dr: DynamoRatchet = new DynamoRatchet(DynamoDBDocument.from(new DynamoDBClient({ region: 'us-east-1' })));
    const opts: DynamoDbSimpleCacheOptions = DynamoDbStorageProvider.createDefaultOptions();
    opts.tableName = 'test-table';
    opts.useRangeKeys = false;
    opts.hashKeyName = 'cacheUid';
    opts.dynamoExpiresColumnName = 'expiresEpochSeconds';

    const ddbStorage: DynamoDbStorageProvider = new DynamoDbStorageProvider(dr, opts);
    const simpleCache: SimpleCache = new SimpleCache(ddbStorage, 1000);

    for (let i = 0; i < 10; i++) {
      const _tests: SimpleCacheObjectWrapper<any> = await simpleCache.fetchWrapper<any>('test' + i, () => Promise.resolve({ x: i }));
    }

    const all: SimpleCacheObjectWrapper<any>[] = await simpleCache.readAll();
    expect(all).not.toBeNull();
    expect(all.length).toBeGreaterThan(9);
    await simpleCache.clearCache();
  }, 60_000);
});

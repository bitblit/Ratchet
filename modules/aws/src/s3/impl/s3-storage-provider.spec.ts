import { S3StorageProvider } from "./s3-storage-provider.js";
import { S3Client } from "@aws-sdk/client-s3";
import { describe, expect, test } from "vitest";
import { S3CacheRatchet } from "../s3-cache-ratchet";
import { SimpleCache } from "../../cache/simple-cache.js";
import { SimpleCacheObjectWrapper } from "../../cache/simple-cache-object-wrapper.js";

describe('#S3StorageProvider', function () {
  test.skip('should read/write/delete with an S3 handler', async () => {
    const s3: S3Client = new S3Client({ region: 'us-east-1' });
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
});

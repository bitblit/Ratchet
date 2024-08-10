import { SimpleCache } from './simple-cache.js';
import { SimpleCacheObjectWrapper } from './simple-cache-object-wrapper.js';
import { describe, expect, test } from 'vitest';
import { MemoryStorageProvider } from './memory-storage-provider.js';

describe('#simpleCache', function () {
  test.skip('should read/write/delete with a memory', async () => {
    const storageProvider: MemoryStorageProvider = new MemoryStorageProvider();

    const simpleCache: SimpleCache = new SimpleCache(storageProvider, 2000000);

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
    const storageProvider: MemoryStorageProvider = new MemoryStorageProvider();
    const simpleCache: SimpleCache = new SimpleCache(storageProvider, 1000);

    for (let i = 0; i < 10; i++) {
      const _tests: SimpleCacheObjectWrapper<any> = await simpleCache.fetchWrapper<any>('test' + i, () => Promise.resolve({ x: i }));
    }

    const all: SimpleCacheObjectWrapper<any>[] = await simpleCache.readAll();
    expect(all).not.toBeNull();
    expect(all.length).toBeGreaterThan(9);
    await simpleCache.clearCache();
  }, 60_000);
});

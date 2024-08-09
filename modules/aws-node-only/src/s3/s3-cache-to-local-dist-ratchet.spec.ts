import { S3CacheToLocalDiskRatchet } from "./s3-cache-to-local-disk-ratchet";
import { S3CacheRatchetLike } from "@bitblit/ratchet-aws/s3/s3-cache-ratchet-like";
import { tmpdir } from "os";
import { beforeEach, describe, expect, test } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

let mockS3CR: MockProxy<S3CacheRatchetLike>;

describe('#S3CacheToLocalDiskRatchet', () => {
  beforeEach(() => {
    mockS3CR = mock<S3CacheRatchetLike>();
  });

  test('should download file and store in tmp', async () => {
    mockS3CR.fetchCacheFileAsBuffer.mockResolvedValue(Buffer.from(JSON.stringify({ a: 'b' })));

    const pth: string = 'test-path';

    const svc: S3CacheToLocalDiskRatchet = new S3CacheToLocalDiskRatchet(mockS3CR, tmpdir()); //, 'tmp', 1000);
    svc.removeCacheFileForKey(pth);

    const proms: Promise<Buffer>[] = [];
    for (let i = 0; i < 5; i++) {
      proms.push(svc.getFileBuffer(pth));
    }

    const all: Buffer[] = await Promise.all(proms);

    expect(all.length).toEqual(5);
  });
});

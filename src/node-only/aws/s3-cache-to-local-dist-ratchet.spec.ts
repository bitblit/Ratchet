import { S3CacheToLocalDiskRatchet } from './s3-cache-to-local-disk-ratchet';
import { tmpdir } from 'os';
import { jest } from '@jest/globals';
import { S3CacheRatchetLike } from '../../aws';
import { JestRatchet } from '../../jest';

let mockS3CR: jest.Mocked<S3CacheRatchetLike>;

describe('#S3CacheToLocalDiskRatchet', () => {
  beforeEach(() => {
    mockS3CR = JestRatchet.mock(jest.fn);
  });

  it('should download file and store in tmp', async () => {
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

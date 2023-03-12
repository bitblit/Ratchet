import { S3CacheToLocalDiskRatchet } from './s3-cache-to-local-disk-ratchet';
import { S3CacheRatchet } from './s3-cache-ratchet';
import { tmpdir } from 'os';
import { JestRatchet } from '@bitblit/ratchet-jest';

let mockS3CR: jest.Mocked<S3CacheRatchet>;

describe('#S3CacheToLocalDiskRatchet', () => {
  beforeEach(() => {
    mockS3CR = JestRatchet.mock();
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

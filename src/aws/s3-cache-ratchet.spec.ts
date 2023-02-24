import { CopyObjectCommandOutput, GetObjectCommandOutput, HeadObjectCommandOutput, PutObjectCommandOutput, S3 } from '@aws-sdk/client-s3';
import { S3CacheRatchet } from './s3-cache-ratchet';
import { Logger } from '../common/logger';
import { JestRatchet } from '../jest';
import { StringReadable } from '../stream/string-readable';
import { StringRatchet } from '../common';

let mockS3: jest.Mocked<S3>;
let mockS3OtherAccount: jest.Mocked<S3>;

describe('#fileExists', function () {
  beforeEach(() => {
    mockS3 = JestRatchet.mock();
    mockS3OtherAccount = JestRatchet.mock();
  });

  xit('should sync 2 folders', async () => {
    const cache1: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test1');
    const cache2: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test2');
    const out: string[] = await cache1.synchronize('src/', 'dst/', cache2);

    expect(out).not.toBeNull();
  }, 60_000);

  it('should return false for files that do not exist', async () => {
    mockS3.headObject.mockReturnValue({
      promise: async () => Promise.reject({ statusCode: 404, $metadata: null } as HeadObjectCommandOutput),
    } as never);
    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const out: boolean = await cache.fileExists('test-missing-file');

    expect(out).toEqual(false);
  });

  it('should create a expiring link', async () => {
    mockS3.getSignedUrl.mockReturnValue('https://test.link/test.jpg');

    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const out: string = await cache.preSignedDownloadUrlForCacheFile('test.jpg', 300);

    expect(out).toEqual('https://test.link/test.jpg');
  });

  it('should copy an object', async () => {
    mockS3.copyObject.mockReturnValue({
      promise: async () => Promise.resolve({} as CopyObjectCommandOutput),
    } as never);
    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const out: boolean = await cache.quietCopyFile('test.png', 'test2.png');

    expect(out).toBeTruthy();
  });

  it('should copy a file to s3', async () => {
    mockS3.putObject.mockReturnValue({
      promise: async () => Promise.resolve({} as PutObjectCommandOutput),
    } as never);

    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const stream: ReadableStream = StringReadable.stringToWebReadableStream('tester');

    const out: PutObjectCommandOutput = await cache.writeReadableStreamToCacheFile(
      's3-cache-ratchet.spec.ts',
      stream,
      null,
      {},
      null,
      'text/typescript'
    );

    expect(out).toBeTruthy();
  });

  xit('should list direct children past 1000', async () => {
    const s3: S3 = new S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const out: string[] = await cache.directChildrenOfPrefix('test/aws/test-path-with-lots-of-childen/');
    expect(out).toBeTruthy();
    expect(out.length).toBeGreaterThan(1000);

    Logger.info('Got: %s', out);
    expect(out).toBeTruthy();
  });

  it('should pull a file as a string', async () => {
    mockS3.getObject.mockReturnValue({
      promise: async () =>
        Promise.resolve({
          Body: StringReadable.stringToWebReadableStream(JSON.stringify({ test: StringRatchet.createRandomHexString(128) })),
          $metadata: null,
        } as GetObjectCommandOutput),
    } as never);

    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const fileName: string = 'test-file.json';

    const outBuf: Buffer = await cache.readCacheFileToBuffer(fileName);
    expect(outBuf).toBeTruthy();
    expect(outBuf.length).toBeGreaterThan(100);

    const outString: string = await cache.readCacheFileToString(fileName);
    expect(outString).toBeTruthy();
    expect(outString.length).toBeGreaterThan(100);

    const outObject: any = await cache.readCacheFileToObject(fileName);
    expect(outObject).toBeTruthy();
    expect(outObject['test']).toBeTruthy();
  });

  xit('should sync cross-account', async () => {
    const cache1: S3CacheRatchet = new S3CacheRatchet(mockS3, 'bucket1');
    const cache2: S3CacheRatchet = new S3CacheRatchet(mockS3OtherAccount, 'bucket2');

    const res: any = await cache1.synchronize('test1/', 'test2/', cache2, true);
    expect(res).not.toBeNull();
  }, 50_000);
});

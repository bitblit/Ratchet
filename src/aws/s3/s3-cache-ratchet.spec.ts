import {
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { S3CacheRatchet } from './s3-cache-ratchet';
import { Logger } from '../../common/logger';
import { StringRatchet } from '../../common';
import { mockClient } from 'aws-sdk-client-mock';
import { StreamRatchet } from '../../stream/stream-ratchet';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(() => Promise.resolve('https://test.link/test.jpg')),
}));

let mockS3 = null;
let mockS3OtherAccount = null;

describe('#fileExists', function () {
  // I'd rather do this above but then typescript screams it does not implement S3Client
  mockS3 = mockClient(S3Client);
  mockS3OtherAccount = mockClient(S3Client);

  beforeEach(() => {
    mockS3.reset();
    mockS3OtherAccount.reset();
  });

  it('should return false for files that do not exist', async () => {
    mockS3.on(HeadObjectCommand).rejects({ statusCode: 404, $metadata: null });
    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const out: boolean = await cache.fileExists('test-missing-file');

    expect(out).toEqual(false);
  });

  // TODO: CAW 2023-02-28 : Make me work after the stub gets fixed for this
  xit('should create a expiring link', async () => {
    //mockS3.getSignedUrl.mockReturnValue('https://test.link/test.jpg');

    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const out: string = await cache.preSignedDownloadUrlForCacheFile('test.jpg', 300);

    expect(out).toEqual('https://test.link/test.jpg');
  });

  it('should copy an object', async () => {
    mockS3.on(CopyObjectCommand).resolves({});
    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const out: boolean = await cache.quietCopyFile('test.png', 'test2.png');

    expect(out).toBeTruthy();
  });

  // TODO: CAW 2023-02-28 : Make me work after the stub gets fixed for this
  xit('should copy a file to s3', async () => {
    //mockS3['config'] = {};
    //mockS3.reset();
    // This mocks for uploading small files
    mockS3.on(PutObjectCommand).resolves({});
    // These mock for the multipart upload command
    mockS3.on(CreateMultipartUploadCommand).resolves({ UploadId: '1' });
    mockS3.on(UploadPartCommand).resolves({ ETag: '1' });

    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const stream: ReadableStream = StreamRatchet.stringToWebReadableStream(StringRatchet.createRandomHexString(1024 * 1024 * 6));

    const out: PutObjectCommandOutput = await cache.writeStreamToCacheFile(
      's3-cache-ratchet.spec.ts',
      stream,
      null,
      {},
      null,
      'text/typescript'
    );

    Logger.info('Calls: %j', mockS3.calls());
    expect(out).toBeTruthy();
  });

  it('should pull a file as a string', async () => {
    // Need to re-call this multiple times to get the stream reset
    async function createNew(): Promise<any> {
      return {
        Body: StreamRatchet.stringToReadable(JSON.stringify({ test: StringRatchet.createRandomHexString(128) })),
        $metadata: null,
      };
    }

    mockS3.on(GetObjectCommand).resolves(createNew());

    const cache: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test-bucket');
    const fileName: string = 'test-file.json';

    const outBuf: Buffer = await cache.readCacheFileToBuffer(fileName);
    expect(outBuf).toBeTruthy();
    expect(outBuf.length).toBeGreaterThan(100);
    mockS3.reset();
    mockS3.on(GetObjectCommand).resolves(createNew());

    const outString: string = await cache.readCacheFileToString(fileName);
    expect(outString).toBeTruthy();
    expect(outString.length).toBeGreaterThan(100);
    mockS3.reset();
    mockS3.on(GetObjectCommand).resolves(createNew());

    const outObject: any = await cache.readCacheFileToObject(fileName);
    expect(outObject).toBeTruthy();
    expect(outObject['test']).toBeTruthy();
  });

  //---

  xit('should sync 2 folders', async () => {
    const cache1: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test1');
    const cache2: S3CacheRatchet = new S3CacheRatchet(mockS3, 'test2');
    const out: string[] = await cache1.synchronize('src/', 'dst/', cache2);

    expect(out).not.toBeNull();
  }, 60_000);

  xit('should list direct children past 1000', async () => {
    const s3: S3Client = new S3Client({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const out: string[] = await cache.directChildrenOfPrefix('test/aws/test-path-with-lots-of-childen/');
    expect(out).toBeTruthy();
    expect(out.length).toBeGreaterThan(1000);

    Logger.info('Got: %s', out);
    expect(out).toBeTruthy();
  });

  xit('should sync cross-account', async () => {
    const cache1: S3CacheRatchet = new S3CacheRatchet(mockS3, 'bucket1');
    const cache2: S3CacheRatchet = new S3CacheRatchet(mockS3OtherAccount, 'bucket2');

    const res: any = await cache1.synchronize('test1/', 'test2/', cache2, true);
    expect(res).not.toBeNull();
  }, 50_000);
});

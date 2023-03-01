import { JestRatchet } from '../../jest';
import { S3CacheRatchet } from '../s3/s3-cache-ratchet';
import { S3ExpiringCodeProvider, S3ExpiringCodeProviderFileWrapper } from './s3-expiring-code-provider';
import { PutObjectCommandOutput, PutObjectOutput } from '@aws-sdk/client-s3';
import { ExpiringCode } from './expiring-code';

let mockS3Ratchet: jest.Mocked<S3CacheRatchet>;
const testCode: ExpiringCode = { code: '12345', context: 'ctx', expiresEpochMS: Date.now() + 100_000, tags: ['tag1'] };
const testCode2: ExpiringCode = { code: '45678', context: 'ctx', expiresEpochMS: Date.now() + 100_000, tags: ['tag1'] };

describe('#S3ExpiringCodeProvider', () => {
  beforeEach(() => {
    mockS3Ratchet = JestRatchet.mock();
    mockS3Ratchet.getDefaultBucket.mockReturnValue('TEST-BUCKET');
  });

  it('Should fetch file', async () => {
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');
    const output: S3ExpiringCodeProviderFileWrapper = await val.fetchFile();

    expect(output).not.toBeFalsy();
    expect(output.data).not.toBeFalsy();
    expect(output.lastModifiedEpochMS).not.toBeFalsy();
  });

  it('Should update file', async () => {
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');
    mockS3Ratchet.writeObjectToCacheFile.mockResolvedValue({} as unknown as PutObjectCommandOutput);

    const wrote: PutObjectOutput = await val.updateFile([testCode]);

    expect(wrote).not.toBeFalsy();
  });

  it('Should check code', async () => {
    mockS3Ratchet.readCacheFileToObject.mockResolvedValue({
      data: [testCode],
      lastModifiedEpochMS: 1234,
    });
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');

    const testValidCode: boolean = await val.checkCode('12345', 'ctx', false);
    const testInvalidCode: boolean = await val.checkCode('09876', 'ctx', false);

    expect(testValidCode).toBeTruthy();
    expect(testInvalidCode).toBeFalsy();
  });

  it('Should store code', async () => {
    mockS3Ratchet.readCacheFileToObject.mockResolvedValue({
      data: [testCode],
      lastModifiedEpochMS: 1234,
    });
    mockS3Ratchet.writeObjectToCacheFile.mockResolvedValue({} as unknown as PutObjectCommandOutput);
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');

    const output: boolean = await val.storeCode(testCode2);

    expect(output).toBeTruthy();
  });
});

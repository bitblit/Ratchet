import { S3ExpiringCodeProvider, S3ExpiringCodeProviderFileWrapper } from "./s3-expiring-code-provider.js";
import { PutObjectCommandOutput, PutObjectOutput } from "@aws-sdk/client-s3";
import { ExpiringCode } from "../../expiring-code/expiring-code.js";
import { beforeEach, describe, expect, test } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";

import { S3CacheRatchetLike } from "../s3-cache-ratchet-like.js";

let mockS3Ratchet: MockProxy<S3CacheRatchetLike>;
const testCode: ExpiringCode = { code: '12345', context: 'ctx', expiresEpochMS: Date.now() + 100_000, tags: ['tag1'] };
const testCode2: ExpiringCode = { code: '45678', context: 'ctx', expiresEpochMS: Date.now() + 100_000, tags: ['tag1'] };

describe('#S3ExpiringCodeProvider', () => {
  beforeEach(() => {
    mockS3Ratchet = mock<S3CacheRatchetLike>();
    mockS3Ratchet.getDefaultBucket.mockReturnValue('TEST-BUCKET');
  });

  test('Should fetch file', async () => {
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');
    const output: S3ExpiringCodeProviderFileWrapper = await val.fetchFile();

    expect(output).not.toBeFalsy();
    expect(output.data).not.toBeFalsy();
    expect(output.lastModifiedEpochMS).not.toBeFalsy();
  });

  test('Should update file', async () => {
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');
    mockS3Ratchet.writeObjectToCacheFile.mockResolvedValue({} as unknown as PutObjectCommandOutput);

    const wrote: PutObjectOutput = await val.updateFile([testCode]);

    expect(wrote).not.toBeFalsy();
  });

  test('Should check code', async () => {
    mockS3Ratchet.fetchCacheFileAsObject.mockResolvedValue({
      data: [testCode],
      lastModifiedEpochMS: 1234,
    });
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');

    const testValidCode: boolean = await val.checkCode('12345', 'ctx', false);
    const testInvalidCode: boolean = await val.checkCode('09876', 'ctx', false);

    expect(testValidCode).toBeTruthy();
    expect(testInvalidCode).toBeFalsy();
  });

  test('Should store code', async () => {
    mockS3Ratchet.fetchCacheFileAsObject.mockResolvedValue({
      data: [testCode],
      lastModifiedEpochMS: 1234,
    });
    mockS3Ratchet.writeObjectToCacheFile.mockResolvedValue({} as unknown as PutObjectCommandOutput);
    const val: S3ExpiringCodeProvider = new S3ExpiringCodeProvider(mockS3Ratchet, 'test.json');

    const output: boolean = await val.storeCode(testCode2);

    expect(output).toBeTruthy();
  });
});

/*
  Objects implementing S3CacheRatchetLike wrap S3 with an ability to store and retrieve objects cached as json files
*/

import { Readable } from 'stream';
import {
  CompleteMultipartUploadCommandOutput,
  CopyObjectCommandOutput,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommandOutput,
  NoSuchKey,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Logger } from '@bitblit/ratchet-common';

export interface S3CacheRatchetLike {
  getDefaultBucket(): string;
  getS3Client(): S3Client;
  fileExists(key: string, bucket?: string): Promise<boolean>;
  fetchCacheFileAsS3GetObjectCommandOutput(key: string, bucket?: string): Promise<GetObjectCommandOutput>;

  fetchCacheFileAsReadableStream(key: string, bucket?: string): Promise<ReadableStream>;

  fetchCacheFileAsBuffer(key: string, bucket?: string): Promise<Buffer>;

  fetchCacheFileAsString(key: string, bucket?: string): Promise<string>;

  fetchCacheFileAsObject<T>(key: string, bucket?: string): Promise<T>;

  removeCacheFile(key: string, bucket?: string): Promise<DeleteObjectCommandOutput>;
  writeObjectToCacheFile(
    key: string,
    dataObject: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    template?: PutObjectCommandInput,
    bucket?: string
  ): Promise<CompleteMultipartUploadCommandOutput>;

  writeStringToCacheFile(
    key: string,
    dataString: string,
    template?: PutObjectCommandInput,
    bucket?: string
  ): Promise<CompleteMultipartUploadCommandOutput>;

  writeStreamToCacheFile(
    key: string,
    data: ReadableStream | Readable,
    template?: PutObjectCommandInput,
    bucket?: string
  ): Promise<CompleteMultipartUploadCommandOutput>;

  synchronize(srcPrefix: string, targetPrefix: string, targetRatchet?: S3CacheRatchetLike, recurseSubFolders?: boolean): Promise<string[]>;
  preSignedDownloadUrlForCacheFile(key: string, expirationSeconds?: number, bucket?: string): Promise<string>;
  fetchMetaForCacheFile(key: string, bucket?: string): Promise<HeadObjectCommandOutput>;
  cacheFileAgeInSeconds(key: string, bucket?: string): Promise<number>;
  copyFile(srcKey: string, dstKey: string, srcBucket?: string, dstBucket?: string): Promise<CopyObjectCommandOutput>;
  quietCopyFile(srcKey: string, dstKey: string, srcBucket?: string, dstBucket?: string): Promise<boolean>;
  directChildrenOfPrefix(prefix: string, expandFiles?: boolean, bucket?: string, maxToReturn?: number): Promise<string[]>;
  allSubFoldersOfPrefix(prefix: string, bucket?: string): Promise<string[]>;
}

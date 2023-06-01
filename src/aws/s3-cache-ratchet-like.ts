/*
  Objects implementing S3CacheRatchetLike wrap S3 with an ability to store and retrieve objects cached as json files
*/

import AWS from 'aws-sdk';
import {CopyObjectOutput, DeleteObjectOutput, HeadObjectOutput, PutObjectOutput,} from 'aws-sdk/clients/s3';
import {Readable} from 'stream';

export interface S3CacheRatchetLike{
   getDefaultBucket(): string ;
   getS3(): AWS.S3 ;
    fileExists(key: string, bucket?: string): Promise<boolean> ;
    readCacheFileToBuffer(key: string, bucket?: string): Promise<Buffer> ;
    readCacheFileToString(key: string, bucket?: string): Promise<string> ;
    readCacheFileToObject<T>(key: string, bucket?: string): Promise<T> ;
    removeCacheFile(key: string, bucket?: string): Promise<DeleteObjectOutput> ;
  // Given new board data, write it to the S3 file and set the refresh flag appropriately
    writeObjectToCacheFile(
    key: string,
    dataObject: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    bucket?: string,
    meta?: Record<string,string>,
    cacheControl?:string,
    contentType?:string
  ): Promise<PutObjectOutput> ;
  // Given new board data, write it to the S3 file and set the refresh flag appropriately
   writeStringToCacheFile(
    key: string,
    dataString: string,
    bucket?: string,
    meta?: Record<string,string>,
    cacheControl?:string,
    contentType?:string
  ): Promise<PutObjectOutput> ;
   writeStreamToCacheFile(
    key: string,
    data: Readable,
    bucket?: string,
    meta?: Record<string,string>,
    cacheControl?:string,
    contentType?:string
  ): Promise<PutObjectOutput> ;
   synchronize(
    srcPrefix: string,
    targetPrefix: string,
    targetRatchet?: S3CacheRatchetLike,
    recurseSubFolders?: boolean
  ): Promise<string[]> ;
   fetchCacheFileAsReadable(key: string, bucket?: string): Readable ;
   preSignedDownloadUrlForCacheFile(key: string, expirationSeconds?:number, bucket?: string): string ;
   fetchMetaForCacheFile(key: string, bucket?: string): Promise<HeadObjectOutput> ;
   cacheFileAgeInSeconds(key: string, bucket?: string): Promise<number> ;
   copyFile(srcKey: string, dstKey: string, srcBucket?: string, dstBucket?: string): Promise<CopyObjectOutput> ;
   quietCopyFile(srcKey: string, dstKey: string, srcBucket?: string, dstBucket?: string): Promise<boolean> ;
   createDownloadLink(key: string, secondsUntilExpiration?:number, bucket?: string): string ;
   directChildrenOfPrefix(
    prefix: string,
    expandFiles?:boolean,
    bucket?: string,
    maxToReturn?: number
  ): Promise<string[]> ;
   allSubFoldersOfPrefix(prefix: string, bucket?: string): Promise<string[]> ;
}

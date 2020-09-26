/*
    Wrap S3 with an ability to store and retrieve objects cached as json files
*/

import * as AWS from 'aws-sdk';
import { Logger } from '../common/logger';
import moment = require('moment');
import {
  CopyObjectOutput,
  CopyObjectRequest,
  DeleteObjectOutput,
  GetObjectOutput,
  HeadObjectOutput,
  ListObjectsOutput,
  ListObjectsV2Output,
  ListObjectsV2Request,
  PutObjectOutput,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';
import { RequireRatchet } from '../common/require-ratchet';
import { ReadStream } from 'fs';

export class S3CacheRatchet {
  constructor(private s3: AWS.S3, private defaultBucket: string = null) {
    RequireRatchet.notNullOrUndefined(this.s3, 's3');
  }

  public getDefaultBucket(): string {
    return this.defaultBucket;
  }

  public getS3(): AWS.S3 {
    return this.s3;
  }

  public async fileExists(key: string, bucket: string = null): Promise<boolean> {
    try {
      const head: HeadObjectOutput = await this.fetchMetaForCacheFile(key, this.bucketVal(bucket));
      return !!head;
    } catch (err) {
      Logger.silly('Error calling file exists (as expected) %s', err);
      return false;
    }
  }

  public async readCacheFileToString(key: string, bucket: string = null): Promise<string> {
    const params = {
      Bucket: this.bucketVal(bucket),
      Key: key,
    };

    try {
      const res: GetObjectOutput = await this.s3.getObject(params).promise();
      if (res && res.Body) {
        return res.Body.toString();
      } else {
        Logger.warn('Could not find cache file : %s / %s', bucket, key);
        return null;
      }
    } catch (err) {
      if (err && err.statusCode === 404) {
        Logger.warn('Cache file %s %s not found returning null', bucket, key);
        return null;
      } else {
        throw err;
      }
    }
  }

  public async readCacheFileToObject<T>(key: string, bucket: string = null): Promise<T> {
    const value: string = await this.readCacheFileToString(key, bucket);
    return value ? (JSON.parse(value) as T) : null;
  }

  public async removeCacheFile(key: string, bucket: string = null): Promise<DeleteObjectOutput> {
    let rval: DeleteObjectOutput = null;
    const params = {
      Bucket: this.bucketVal(bucket),
      Key: key,
    };
    try {
      rval = await this.s3.deleteObject(params).promise();
    } catch (err) {
      if (err && err.statusCode == 404) {
        Logger.info('Swallowing 404 deleting missing object %s %s', bucket, key);
        rval = null;
      } else {
        throw err;
      }
    }
    return rval;
  }

  // Given new board data, write it to the S3 file and set the refresh flag appropriately
  public async writeObjectToCacheFile(
    key: string,
    dataObject: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    bucket: string = null,
    meta: any = {},
    cacheControl = 'max-age=30',
    contentType = 'application/json'
  ): Promise<PutObjectOutput> {
    const json = JSON.stringify(dataObject);
    return this.writeStringToCacheFile(key, json, bucket, meta, cacheControl, contentType);
  }

  // Given new board data, write it to the S3 file and set the refresh flag appropriately
  public async writeStringToCacheFile(
    key: string,
    dataString: string,
    bucket: string = null,
    meta: any = {},
    cacheControl = 'max-age=30',
    contentType = 'text/plain'
  ): Promise<PutObjectOutput> {
    const params = {
      Bucket: this.bucketVal(bucket),
      Key: key,
      Body: dataString,
      CacheControl: cacheControl,
      ContentType: contentType,
      Metadata: meta,
    };

    const result: PutObjectOutput = await this.s3.putObject(params).promise();
    return result;
  }

  public async writeStreamToCacheFile(
    key: string,
    data: ReadStream,
    bucket: string = null,
    meta: any = {},
    cacheControl = 'max-age=30',
    contentType = 'text/plain'
  ): Promise<PutObjectOutput> {
    const params: PutObjectRequest = {
      Bucket: this.bucketVal(bucket),
      Key: key,
      Body: data,
      CacheControl: cacheControl,
      ContentType: contentType,
      Metadata: meta,
    };

    const result: PutObjectOutput = await this.s3.putObject(params).promise();
    return result;
  }

  public preSignedDownloadUrlForCacheFile(key: string, expirationSeconds = 3600, bucket: string = null): string {
    const link: string = this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketVal(bucket),
      Key: key,
      Expires: expirationSeconds,
    });
    return link;
  }

  public async fetchMetaForCacheFile(key: string, bucket: string = null): Promise<HeadObjectOutput> {
    let rval: HeadObjectOutput = null;
    try {
      rval = await this.s3
        .headObject({
          Bucket: this.bucketVal(bucket),
          Key: key,
        })
        .promise();
    } catch (err) {
      if (err && err.statusCode == 404) {
        Logger.warn('Cache file %s %s not found returning null', this.bucketVal(bucket), key);
        rval = null;
      } else {
        throw err;
      }
    }
    return rval;
  }

  public async cacheFileAgeInSeconds(key: string, bucket: string = null): Promise<number> {
    try {
      const res: HeadObjectOutput = await this.fetchMetaForCacheFile(key, bucket);
      if (res && res.LastModified) {
        const mom = moment(res.LastModified);
        return moment().unix() - mom.unix();
      } else {
        Logger.warn('Cache file %s %s had no last modified returning null', this.bucketVal(bucket), key);
        return null;
      }
    } catch (err) {
      if (err && err.statusCode == 404) {
        Logger.warn('Cache file %s %s not found returning null', this.bucketVal(bucket), key);
        return null;
      } else {
        throw err;
      }
    }
  }

  public async copyFile(srcKey: string, dstKey: string, srcBucket: string = null, dstBucket: string = null): Promise<CopyObjectOutput> {
    const params: CopyObjectRequest = {
      CopySource: '/' + this.bucketVal(srcBucket) + '/' + srcKey,
      Bucket: this.bucketVal(dstBucket),
      Key: dstKey,
      MetadataDirective: 'COPY',
    };
    const rval: CopyObjectOutput = await this.s3.copyObject(params).promise();
    return rval;
  }

  public async quietCopyFile(srcKey: string, dstKey: string, srcBucket: string = null, dstBucket: string = null): Promise<boolean> {
    let rval: boolean = false;
    try {
      const tmp: CopyObjectOutput = await this.copyFile(srcKey, dstKey, srcBucket, dstBucket);
      rval = true;
    } catch (err) {
      Logger.silly('Failed to copy file in S3 : %s', err);
    }
    return rval;
  }

  public createDownloadLink(key: string, secondsUntilExpiration = 3600, bucket: string = null): string {
    // URL
    const params = { Bucket: this.bucketVal(bucket), Key: key, Expires: secondsUntilExpiration };
    const url = this.s3.getSignedUrl('getObject', params);
    return url;
  }

  public async directChildrenOfPrefix(prefix: string, expandFiles = false, bucket: string = null): Promise<string[]> {
    const returnValue: any[] = [];

    const params: any = {
      Bucket: this.bucketVal(bucket),
      Prefix: prefix,
      Delimiter: '/',
    };

    const response: ListObjectsOutput = await this.s3.listObjects(params).promise();

    const prefixLength = prefix.length;
    // Process directories
    if (response['CommonPrefixes']) {
      response['CommonPrefixes'].forEach((cp) => {
        const value = cp['Prefix'].substring(prefixLength);
        returnValue.push(value);
      });
    }

    // Process files
    if (response['Contents']) {
      response['Contents'].forEach((cp) => {
        if (expandFiles) {
          const expanded: ExpandedFileChildren = {
            link: this.createDownloadLink(cp['Key'], 3600, bucket),
            name: cp['Key'].substring(prefixLength),
            size: cp['Size'],
          };
          returnValue.push(expanded);
        } else {
          returnValue.push(cp['Key'].substring(prefixLength));
        }
      });
      // TODO: Need to handle large batches that need pagination
    }
    return returnValue;
  }

  public async allSubFoldersOfPrefix(prefix: string, bucket: string = null): Promise<string[]> {
    const returnValue: string[] = [prefix];
    let idx: number = 0;

    while (idx < returnValue.length) {
      const next: string = returnValue[idx++];
      Logger.debug('Pulling %s (%d remaining)', next, returnValue.length - idx);
      const req: ListObjectsV2Request = {
        Bucket: this.bucketVal(bucket),
        Prefix: next,
        Delimiter: '/',
      };
      let resp: ListObjectsV2Output = null;

      do {
        req.ContinuationToken = resp ? resp.NextContinuationToken : null;
        resp = await this.s3.listObjectsV2(req).promise();
        resp.CommonPrefixes.forEach((p) => {
          returnValue.push(p.Prefix);
        });
        Logger.debug('g:%j', resp);
      } while (resp.NextContinuationToken);
    }

    return returnValue;
  }

  private bucketVal(explicitBucket: string): string {
    const rval: string = explicitBucket ? explicitBucket : this.defaultBucket;
    if (!rval) {
      throw 'You must set either the default bucket or pass it explicitly';
    }
    return rval;
  }
}

export interface ExpandedFileChildren {
  link: string;
  name: string;
  size: number;
}

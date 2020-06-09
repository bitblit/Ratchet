/*
    Wrap S3 with an ability to store and retrieve objects cached as json files
*/

import * as AWS from 'aws-sdk';
import { Logger } from '../common/logger';
import moment = require('moment');
import { DeleteObjectOutput, HeadObjectOutput, ListObjectsOutput, PutObjectOutput } from 'aws-sdk/clients/s3';

export class S3CacheRatchet {
  constructor(private s3: AWS.S3, private defaultBucket: string = null) {
    if (!s3) {
      throw 'S3 may not be null';
    }
    this.s3 = s3;
    this.defaultBucket = defaultBucket;
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

  public readCacheFileToString(key: string, bucket: string = null): Promise<string> {
    const params = {
      Bucket: this.bucketVal(bucket),
      Key: key,
    };

    return this.s3
      .getObject(params)
      .promise()
      .then((res) => {
        if (res && res.Body) {
          return res.Body.toString();
        } else {
          Logger.warn('Could not find cache file : %s / %s', bucket, key);
          return null;
        }
      })
      .catch((err) => {
        if (err && err.statusCode === 404) {
          Logger.warn('Cache file %s %s not found returning null', bucket, key);
          return null;
        } else {
          throw err;
        }
      });
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
  public writeObjectToCacheFile(
    key: string,
    dataObject: any,
    bucket: string = null,
    meta: any = {},
    cacheControl = 'max-age=30',
    contentType = 'application/json'
  ): Promise<any> {
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

  public createDownloadLink(key: string, secondsUntilExpiration = 3600, bucket: string = null): string {
    // URL
    const params = { Bucket: this.bucketVal(bucket), Key: key, Expires: secondsUntilExpiration };
    const url = this.s3.getSignedUrl('getObject', params);
    return url;
  }

  public async directChildrenOfPrefix(prefix: string, expandFiles = false, bucket: string = null): Promise<string[]> {
    const returnValue = [];

    const params = {
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
          const expanded = {
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

  private bucketVal(explicitBucket: string): string {
    const rval: string = explicitBucket ? explicitBucket : this.defaultBucket;
    if (!rval) {
      throw 'You must set either the default bucket or pass it explicitly';
    }
    return rval;
  }
}

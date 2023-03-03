import {
  CompleteMultipartUploadCommandOutput,
  CopyObjectCommand,
  CopyObjectCommandInput,
  CopyObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandInput,
  ListObjectsCommandOutput,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  NoSuchKey,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Logger } from '../../common/logger';
import { RequireRatchet } from '../../common/require-ratchet';
import { StopWatch } from '../../common/stop-watch';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { StringRatchet } from '../../common/string-ratchet';
import { StreamRatchet } from '../../stream/stream-ratchet';

export class S3CacheRatchet {
  constructor(private s3: S3Client, private defaultBucket: string = null) {
    RequireRatchet.notNullOrUndefined(this.s3, 's3');
  }

  public static applyCacheControlMaxAge(input: PutObjectCommandInput, seconds: number): PutObjectCommandInput {
    if (input && seconds) {
      input.CacheControl = 'max-age=' + seconds;
    }
    return input;
  }

  public static applyUserMetaData(input: PutObjectCommandInput, key: string, value: string): PutObjectCommandInput {
    if (input && StringRatchet.trimToNull(key) && StringRatchet.trimToNull(value)) {
      input.Metadata = input.Metadata || {};
      input.Metadata[key] = value;
    }
    return input;
  }

  public getDefaultBucket(): string {
    return this.defaultBucket;
  }

  public getS3Client(): S3Client {
    return this.s3;
  }

  public async fileExists(key: string, bucket: string = null): Promise<boolean> {
    try {
      const head: HeadObjectCommandOutput = await this.fetchMetaForCacheFile(key, this.bucketVal(bucket));
      return !!head;
    } catch (err) {
      Logger.silly('Error calling file exists (as expected) %s', err);
      return false;
    }
  }

  public async fetchCacheFileAsS3GetObjectCommandOutput(key: string, bucket: string = null): Promise<GetObjectCommandOutput> {
    let rval: GetObjectCommandOutput = null;
    try {
      const params: GetObjectCommandInput = {
        Bucket: this.bucketVal(bucket),
        Key: key,
      };
      rval = await this.s3.send(new GetObjectCommand(params));
    } catch (err) {
      if (err instanceof NoSuchKey) {
        Logger.debug('Key %s not found - returning null', key);
        rval = null;
      } else {
        // Rethrow everything else
        throw err;
      }
    }
    return rval;
  }

  public async fetchCacheFileAsReadableStream(key: string, bucket: string = null): Promise<ReadableStream> {
    const out: GetObjectCommandOutput = await this.fetchCacheFileAsS3GetObjectCommandOutput(key, bucket);
    return out.Body.transformToWebStream();
  }

  public async fetchCacheFileAsBuffer(key: string, bucket: string = null): Promise<Buffer> {
    let rval: Buffer = null;
    const out: GetObjectCommandOutput = await this.fetchCacheFileAsS3GetObjectCommandOutput(key, bucket);
    if (out?.Body) {
      const tmp: Uint8Array = await out.Body.transformToByteArray();
      rval = Buffer.from(tmp);
    }
    return rval;
  }

  public async fetchCacheFileAsString(key: string, bucket: string = null): Promise<string> {
    let rval: string = null;
    const out: GetObjectCommandOutput = await this.fetchCacheFileAsS3GetObjectCommandOutput(key, bucket);
    if (out?.Body) {
      rval = await out.Body.transformToString();
    }
    return rval;
  }

  public async fetchCacheFileAsObject<T>(key: string, bucket: string = null): Promise<T> {
    const value: string = await this.fetchCacheFileAsString(key, bucket);
    return value ? (JSON.parse(value) as T) : null;
  }

  public async removeCacheFile(key: string, bucket: string = null): Promise<DeleteObjectCommandOutput> {
    let rval: DeleteObjectCommandOutput = null;
    const params: DeleteObjectCommandInput = {
      Bucket: this.bucketVal(bucket),
      Key: key,
    };
    try {
      rval = await this.s3.send(new DeleteObjectCommand(params));
    } catch (err) {
      if (err && err['statusCode'] == 404) {
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
    template?: PutObjectCommandInput,
    bucket?: string
  ): Promise<CompleteMultipartUploadCommandOutput> {
    const json = JSON.stringify(dataObject);
    return this.writeStringToCacheFile(key, json, template, bucket);
  }

  // Given new board data, write it to the S3 file and set the refresh flag appropriately
  public async writeStringToCacheFile(
    key: string,
    dataString: string,
    template?: PutObjectCommandInput,
    bucket?: string
  ): Promise<CompleteMultipartUploadCommandOutput> {
    const stream: ReadableStream = StreamRatchet.stringToWebReadableStream(dataString);
    return this.writeStreamToCacheFile(key, stream, template, bucket);
  }

  public async writeStreamToCacheFile(
    key: string,
    data: ReadableStream | Readable,
    template?: PutObjectCommandInput,
    bucket?: string
  ): Promise<CompleteMultipartUploadCommandOutput> {
    const params: PutObjectCommandInput = Object.assign({}, template || {}, {
      Bucket: this.bucketVal(bucket),
      Key: key,
      Body: data,
    });

    const upload: Upload = new Upload({
      client: this.s3,
      params: params,
      tags: [],
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    upload.on('httpUploadProgress', (progress) => {
      Logger.info('Uploading : %s', progress);
    });
    const result: CompleteMultipartUploadCommandOutput = await upload.done();

    return result;
  }

  public async synchronize(
    srcPrefix: string,
    targetPrefix: string,
    targetRatchet: S3CacheRatchet = this,
    recurseSubFolders: boolean = false
  ): Promise<string[]> {
    RequireRatchet.notNullOrUndefined(srcPrefix, 'srcPrefix');
    RequireRatchet.notNullOrUndefined(targetPrefix, 'targetPrefix');
    RequireRatchet.true(srcPrefix.endsWith('/'), 'srcPrefix must end in /');
    RequireRatchet.true(targetPrefix.endsWith('/'), 'targetPrefix must end in /');
    let rval: string[] = [];
    const sourceFiles: string[] = await this.directChildrenOfPrefix(srcPrefix);
    const targetFiles: string[] = await targetRatchet.directChildrenOfPrefix(targetPrefix);
    const sw: StopWatch = new StopWatch();

    for (let i = 0; i < sourceFiles.length; i++) {
      const sourceFile: string = sourceFiles[i];
      Logger.info('Processing %s : %s', sourceFile, sw.dumpExpected(i / sourceFiles.length));
      if (sourceFile.endsWith('/')) {
        if (recurseSubFolders) {
          Logger.info('%s is a subfolder - recursing');
          const subs: string[] = await this.synchronize(
            srcPrefix + sourceFile,
            targetPrefix + sourceFile,
            targetRatchet,
            recurseSubFolders
          );
          Logger.info('Got %d back from %s', subs.length, sourceFile);
          rval = rval.concat(subs);
        } else {
          Logger.info('%s is a subfolder and recurse not specified - skipping', sourceFile);
        }
      } else {
        let shouldCopy: boolean = true;
        const srcMeta: HeadObjectCommandOutput = await this.fetchMetaForCacheFile(srcPrefix + sourceFile);
        if (targetFiles.includes(sourceFile)) {
          const targetMeta: HeadObjectCommandOutput = await targetRatchet.fetchMetaForCacheFile(targetPrefix + sourceFile);
          if (srcMeta.ETag === targetMeta.ETag) {
            Logger.debug('Skipping - identical');
            shouldCopy = false;
          }
        }
        if (shouldCopy) {
          Logger.debug('Copying...');
          const srcStream: ReadableStream = await this.fetchCacheFileAsReadableStream(srcPrefix + sourceFile);
          try {
            const written: PutObjectCommandOutput = await targetRatchet.writeStreamToCacheFile(
              targetPrefix + sourceFile,
              srcStream,
              srcMeta as unknown as PutObjectCommandInput, // Carry forward any metadata
              undefined
            );
            Logger.silly('Write result : %j', written);
            rval.push(sourceFile);
          } catch (err) {
            Logger.error('Failed to sync : %s : %s', sourceFile, err);
          }
        }
      }
    }

    Logger.info('Found %d files, copied %d', sourceFiles.length, rval.length);
    sw.log();
    return rval;
  }

  public async fetchMetaForCacheFile(key: string, bucket: string = null): Promise<HeadObjectCommandOutput> {
    let rval: HeadObjectCommandOutput = null;
    try {
      rval = await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucketVal(bucket),
          Key: key,
        })
      );
    } catch (err) {
      if (err && err['statusCode'] == 404) {
        Logger.info('Cache file %s %s not found returning null', this.bucketVal(bucket), key);
        rval = null;
      } else {
        Logger.error('Unrecognized error, rethrowing : %s', err, err);
        throw err;
      }
    }
    return rval;
  }

  public async cacheFileAgeInSeconds(key: string, bucket: string = null): Promise<number> {
    try {
      const res: HeadObjectCommandOutput = await this.fetchMetaForCacheFile(key, bucket);
      if (res && res.LastModified) {
        return Math.floor((new Date().getTime() - res.LastModified.getTime()) / 1000);
      } else {
        Logger.warn('Cache file %s %s had no last modified returning null', this.bucketVal(bucket), key);
        return null;
      }
    } catch (err) {
      if (err && err['statusCode'] == 404) {
        Logger.warn('Cache file %s %s not found returning null', this.bucketVal(bucket), key);
        return null;
      } else {
        throw err;
      }
    }
  }

  public async copyFile(
    srcKey: string,
    dstKey: string,
    srcBucket: string = null,
    dstBucket: string = null
  ): Promise<CopyObjectCommandOutput> {
    const params: CopyObjectCommandInput = {
      CopySource: '/' + this.bucketVal(srcBucket) + '/' + srcKey,
      Bucket: this.bucketVal(dstBucket),
      Key: dstKey,
      MetadataDirective: 'COPY',
    };
    const rval: CopyObjectCommandOutput = await this.s3.send(new CopyObjectCommand(params));
    return rval;
  }

  public async quietCopyFile(srcKey: string, dstKey: string, srcBucket: string = null, dstBucket: string = null): Promise<boolean> {
    let rval: boolean = false;
    try {
      const tmp: CopyObjectCommandOutput = await this.copyFile(srcKey, dstKey, srcBucket, dstBucket);
      rval = true;
    } catch (err) {
      Logger.silly('Failed to copy file in S3 : %s', err);
    }
    return rval;
  }

  public async preSignedDownloadUrlForCacheFile(key: string, expirationSeconds = 3600, bucket: string = null): Promise<string> {
    const getCommand: GetObjectCommandInput = {
      Bucket: this.bucketVal(bucket),
      Key: key,
    };
    const link: string = await getSignedUrl(this.s3, new GetObjectCommand(getCommand), { expiresIn: expirationSeconds });
    return link;
  }

  public async directChildrenOfPrefix(
    prefix: string,
    expandFiles = false,
    bucket: string = null,
    maxToReturn: number = null
  ): Promise<string[]> {
    const returnValue: any[] = [];

    const params: ListObjectsCommandInput = {
      Bucket: this.bucketVal(bucket),
      Prefix: prefix,
      Delimiter: '/',
    };

    let response: ListObjectsCommandOutput = null;
    do {
      response = await this.s3.send(new ListObjectsCommand(params));

      const prefixLength = prefix.length;
      // Process directories
      if (response['CommonPrefixes']) {
        response['CommonPrefixes'].forEach((cp) => {
          if (!maxToReturn || returnValue.length < maxToReturn) {
            const value = cp['Prefix'].substring(prefixLength);
            returnValue.push(value);
          }
        });
      }

      // Process files
      if (response['Contents']) {
        await Promise.all(
          response['Contents'].map(async (cp) => {
            if (!maxToReturn || returnValue.length < maxToReturn) {
              if (expandFiles) {
                const expanded: ExpandedFileChildren = {
                  link: await this.preSignedDownloadUrlForCacheFile(cp['Key'], 3600, bucket),
                  name: cp['Key'].substring(prefixLength),
                  size: cp['Size'],
                };
                returnValue.push(expanded);
              } else {
                returnValue.push(cp['Key'].substring(prefixLength));
              }
            }
          })
        );
      }
      params.Marker = response.NextMarker;
    } while (params.Marker && (!maxToReturn || returnValue.length < maxToReturn));

    return returnValue;
  }

  public async allSubFoldersOfPrefix(prefix: string, bucket: string = null): Promise<string[]> {
    const returnValue: string[] = [prefix];
    let idx: number = 0;

    while (idx < returnValue.length) {
      const next: string = returnValue[idx++];
      Logger.debug('Pulling %s (%d remaining)', next, returnValue.length - idx);
      const req: ListObjectsV2CommandInput = {
        Bucket: this.bucketVal(bucket),
        Prefix: next,
        Delimiter: '/',
      };
      let resp: ListObjectsV2CommandOutput = null;

      do {
        req.ContinuationToken = resp ? resp.NextContinuationToken : null;
        resp = await this.s3.send(new ListObjectsCommand(req));
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

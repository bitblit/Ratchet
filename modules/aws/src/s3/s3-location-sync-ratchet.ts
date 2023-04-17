import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  GetObjectCommand,
  GetObjectOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import _ from 'lodash';
import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lib/lang/require-ratchet.js';
import { PromiseRatchet } from '@bitblit/ratchet-common/lib/lang/promise-ratchet.js';
import { Upload } from '@aws-sdk/lib-storage';

export interface S3LocationSyncRatchetConfig {
  srcS3: S3Client;
  srcBucket: string;
  srcPrefix: string;
  dstS3: S3Client;
  dstBucket: string;
  dstPrefix: string;
  maxNumThreads?: number;
  maxRetries?: number;
}

interface BucketCmpResult {
  needCopy: Array<S3Object>;
  existed: Array<S3Object>;
  diff: Array<S3Object>;
}

interface S3Object {
  Key: string;
  ETag: string;
  Size: number;
  LastModified: Date;
}

export class S3LocationSyncRatchet {
  private config: S3LocationSyncRatchetConfig;

  constructor(config: S3LocationSyncRatchetConfig) {
    RequireRatchet.notNullOrUndefined(config, 'config');

    this.config = config;

    if (!this.config.maxNumThreads) {
      this.config.maxNumThreads = 15;
    }

    if (!this.config.maxRetries) {
      this.config.maxRetries = 5;
    }
  }

  public updateSrcPrefix(prefix: string): void {
    this.config.srcPrefix = prefix;
  }

  public updateDstPrefix(prefix: string): void {
    this.config.dstPrefix = prefix;
  }

  public async copyObject(key: string, size: number, express = false): Promise<void> {
    const dstKey = key.replace(this.config.srcPrefix, this.config.dstPrefix);
    let completedCopying = false;
    let retries = 0;
    while (!completedCopying && retries < this.config.maxRetries) {
      Logger.debug(`${retries > 0 ? `Retry ${retries} ` : ''}${express ? 'Express' : 'Slow'} copying
                [${[this.config.srcBucket, key].join('/')} ---> ${[this.config.dstBucket, dstKey].join('/')}]`);
      try {
        if (express) {
          const params: CopyObjectCommandInput = {
            CopySource: encodeURIComponent([this.config.srcBucket, key].join('/')),
            Bucket: this.config.dstBucket,
            Key: dstKey,
            MetadataDirective: 'COPY',
          };
          await this.config.dstS3.send(new CopyObjectCommand(params));
        } else {
          const fetched: GetObjectOutput = await this.config.srcS3.send(new GetObjectCommand({ Bucket: this.config.srcBucket, Key: key }));
          const params: PutObjectCommandInput = {
            Bucket: this.config.dstBucket,
            Key: dstKey,
            Body: fetched.Body,
            ContentLength: size,
          };

          const upload: Upload = new Upload({
            client: this.config.dstS3,
            params: params,
            tags: [],
            queueSize: 4,
            partSize: 1024 * 1024 * 5,
            leavePartsOnError: false,
          });

          upload.on('httpUploadProgress', (progress) => {
            Logger.info('Uploading : %s', progress);
          });
          await upload.done();
        }

        completedCopying = true;
      } catch (err) {
        Logger.warn(
          `Can't ${express ? 'express' : 'slow'} copy
                  [${[this.config.srcBucket, key].join('/')} ---> ${[this.config.dstBucket, dstKey].join('/')}]: %j`,
          err
        );
        retries++;
      }
    }

    Logger.debug(`Finished ${express ? 'express' : 'slow'} copying
                  [${[this.config.srcBucket, key].join('/')} ---> ${[this.config.dstBucket, dstKey].join('/')}]`);
  }

  public async listObjects(bucket: string, prefix: string, s3: S3Client): Promise<any> {
    Logger.info(`Scanning bucket [${[bucket, prefix].join('/')}]`);

    const params: ListObjectsV2CommandInput = {
      Bucket: bucket,
      Prefix: prefix,
    };

    let more = true;
    const rval = {};

    while (more) {
      const response: ListObjectsV2CommandOutput = await s3.send(new ListObjectsV2Command(params));
      more = response.IsTruncated;
      _.each(response.Contents, (obj) => {
        rval[obj.Key] = { Key: obj.Key, LastModified: obj.LastModified, ETag: obj.ETag, Size: obj.Size };
      });

      if (more) {
        params.ContinuationToken = response.NextContinuationToken;
      }
    }
    return rval;
  }

  public async startSyncing(): Promise<boolean> {
    Logger.info(`Syncing [${this.config.srcBucket}/${this.config.srcPrefix}
                  ---> ${this.config.dstBucket}/${this.config.dstPrefix}]`);
    const cp = async (obj: S3Object) => {
      await this.copyObject(obj.Key, obj.Size);
    };

    let cmpResult: BucketCmpResult = await this.compareSrcAndDst();

    if (cmpResult.needCopy.length > 0 || cmpResult.diff.length > 0) {
      await PromiseRatchet.runBoundedParallelSingleParam<void>(cp, cmpResult.needCopy, this, this.config.maxNumThreads);
      await PromiseRatchet.runBoundedParallelSingleParam<void>(cp, cmpResult.diff, this, this.config.maxNumThreads);

      Logger.info('Verifying...');
      cmpResult = await this.compareSrcAndDst();
      Logger.debug('Compare result %j', cmpResult);
    }
    return cmpResult.needCopy.length === 0 && cmpResult.diff.length === 0;
  }

  private async compareSrcAndDst(): Promise<BucketCmpResult> {
    const getSrc: Promise<any> = this.listObjects(this.config.srcBucket, this.config.srcPrefix, this.config.srcS3);
    const getDst: Promise<any> = this.listObjects(this.config.dstBucket, this.config.dstPrefix, this.config.dstS3);

    const srcObjs = await getSrc;
    const dstObjs = await getDst;

    const rval: BucketCmpResult = {
      needCopy: [],
      existed: [],
      diff: [],
    };

    await PromiseRatchet.runBoundedParallelSingleParam(
      (key) => {
        const sObj: any = srcObjs[key];
        const dstKey: string = key.replace(this.config.srcPrefix, this.config.dstPrefix);
        const dObj: any = dstObjs.hasOwnProperty(dstKey) ? dstObjs[dstKey] : undefined;
        if (!dObj) {
          rval.needCopy.push(sObj);
          return;
        }

        if (sObj.Size !== dObj.Size) {
          rval.diff.push(sObj);
          return;
        }

        if (sObj.LastModified.getTime() <= dObj.LastModified.getTime()) {
          rval.existed.push(sObj);
          return;
        }

        rval.diff.push(sObj);
      },
      Object.keys(srcObjs),
      this,
      this.config.maxNumThreads
    );
    return rval;
  }
}

import { Logger, StringRatchet } from '@bitblit/ratchet-common';
import { DaemonProcessState } from './daemon-process-state.js';
import { DaemonProcessCreateOptions } from './daemon-process-create-options.js';
import {
  CompleteMultipartUploadCommandOutput,
  HeadObjectOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectOutput,
  PutObjectRequest,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { S3CacheRatchetLike } from '../s3/s3-cache-ratchet-like.js';
import { DaemonStreamDataOptions } from './daemon-stream-data-options.js';

/**
 * Internal utilities which are here for the USE OF THE DAEMON OBJECT ONLY - if you are trying to use this
 * class outside of Ratchet, you are doing it wrong.  Instantiate a Daemon object and use that instead.
 *
 * The details of storage and retrieval of a DaemonProcessState is meant to be transparent to the user
 */
export class DaemonUtil {
  public static DEFAULT_CONTENT: Buffer = Buffer.from('DAEMON_PLACEHOLDER');
  public static DAEMON_METADATA_KEY: string = 'daemon_meta'; // Must be lowercase for s3

  public static async start(
    cache: S3CacheRatchetLike,
    id: string,
    s3Key: string,
    options: DaemonProcessCreateOptions,
  ): Promise<DaemonProcessState> {
    try {
      options.meta = options.meta || {};

      Logger.info('Starting daemon, key: %s, options: %j', s3Key, options);
      const now: number = new Date().getTime();

      const newState: DaemonProcessState = {
        id: id,
        title: options.title,
        lastUpdatedEpochMS: now,
        lastUpdatedMessage: 'Created',
        targetFileName: options.targetFileName,

        startedEpochMS: now,
        completedEpochMS: null,
        meta: options.meta,
        error: null,
        link: null,
        contentType: options.contentType,
      };

      const rval: DaemonProcessState = await DaemonUtil.writeState(cache, s3Key, newState, DaemonUtil.DEFAULT_CONTENT);
      return rval;
    } catch (err) {
      Logger.error('Error while trying to start a daemon: %j %s', options, err);
      throw err;
    }
  }

  public static async writeState(
    cache: S3CacheRatchetLike,
    s3Key: string,
    newState: DaemonProcessState,
    contents: Uint8Array, // This was Buffer before, moving to Uint8array to be node/browser ok.  Need a streaming version
  ): Promise<DaemonProcessState> {
    try {
      const s3meta: any = {};
      newState.lastUpdatedEpochMS = new Date().getTime();
      s3meta[DaemonUtil.DAEMON_METADATA_KEY] = JSON.stringify(newState);

      const params: PutObjectCommandInput = {
        Bucket: cache.getDefaultBucket(),
        Key: s3Key,
        ContentType: newState.contentType,
        Metadata: s3meta,
        Body: contents,
      };
      if (newState.targetFileName) {
        params.ContentDisposition = 'attachment;filename="' + newState.targetFileName + '"';
      }

      const written: PutObjectOutput = await cache.getS3Client().send(new PutObjectCommand(params));
      Logger.silly('Daemon wrote : %s', written);

      return DaemonUtil.stat(cache, s3Key);
    } catch (err) {
      Logger.error('Error while trying to write a daemon stat: %j %s', newState, err);
      throw err;
    }
  }

  public static async streamDataAndFinish(
    cache: S3CacheRatchetLike,
    s3Key: string,
    data: Readable,
    options?: DaemonStreamDataOptions,
  ): Promise<DaemonProcessState> {
    Logger.debug('Streaming data to %s', s3Key);
    const inStat: DaemonProcessState = await DaemonUtil.updateMessage(cache, s3Key, 'Streaming data');
    inStat.completedEpochMS = new Date().getTime();
    inStat.lastUpdatedMessage = 'Complete';

    const s3meta: any = {};
    s3meta[DaemonUtil.DAEMON_METADATA_KEY] = JSON.stringify(inStat);

    const params: PutObjectRequest = {
      Bucket: cache.getDefaultBucket(),
      Key: s3Key,
      ContentType: inStat.contentType,
      Metadata: s3meta,
      Body: data,
    };
    const targetFileName: string =
      StringRatchet.trimToNull(options?.overrideTargetFileName) || StringRatchet.trimToNull(inStat?.targetFileName);
    if (targetFileName) {
      params.ContentDisposition = 'attachment;filename="' + targetFileName + '"';
    }

    const upload: Upload = new Upload({
      client: cache.getS3Client(),
      params: params,
      tags: [],
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false,
    });

    upload.on('httpUploadProgress', (progress) => {
      Logger.info('Uploading : %s', progress);
    });
    const written: CompleteMultipartUploadCommandOutput = await upload.done();

    Logger.silly('Daemon wrote : %s', written);

    return DaemonUtil.stat(cache, s3Key);
  }

  public static async updateMessage(cache: S3CacheRatchetLike, s3Key: string, newMessage: string): Promise<DaemonProcessState> {
    try {
      const inStat: DaemonProcessState = await DaemonUtil.stat(cache, s3Key);
      inStat.lastUpdatedMessage = newMessage;
      return DaemonUtil.writeState(cache, s3Key, inStat, DaemonUtil.DEFAULT_CONTENT);
    } catch (err) {
      Logger.error('Error while trying to update a daemon message: %j %s', s3Key, err);
      throw err;
    }
  }

  public static async stat(s3Cache: S3CacheRatchetLike, path: string): Promise<DaemonProcessState> {
    try {
      Logger.debug('Daemon stat for path %s / %s', s3Cache.getDefaultBucket(), path);
      let stat: DaemonProcessState = null;

      const meta: HeadObjectOutput = await s3Cache.fetchMetaForCacheFile(path);
      Logger.debug('Daemon: Meta is %j', meta);
      const metaString: string = meta && meta.Metadata ? meta.Metadata[DaemonUtil.DAEMON_METADATA_KEY] : null;
      if (metaString) {
        stat = JSON.parse(metaString) as DaemonProcessState;

        if (stat.completedEpochMS && !stat.error) {
          stat.link = await s3Cache.preSignedDownloadUrlForCacheFile(path);
        }
      } else {
        Logger.warn('No metadata found! (Head was %j)', meta);
      }
      return stat;
    } catch (err) {
      Logger.error('Error while trying to fetch a daemon state: %j %s', path, err);
      throw err;
    }
  }

  public static async abort(s3Cache: S3CacheRatchetLike, path: string): Promise<DaemonProcessState> {
    return DaemonUtil.error(s3Cache, path, 'Aborted');
  }
  public static async error(s3Cache: S3CacheRatchetLike, path: string, error: string): Promise<DaemonProcessState> {
    try {
      const inStat: DaemonProcessState = await DaemonUtil.stat(s3Cache, path);
      inStat.error = error;
      inStat.completedEpochMS = new Date().getTime();
      return DaemonUtil.writeState(s3Cache, path, inStat, DaemonUtil.DEFAULT_CONTENT);
    } catch (err) {
      Logger.error('Error while trying to write a daemon error: %j %s', path, err);
      throw err;
    }
  }

  public static async finalize(s3Cache: S3CacheRatchetLike, path: string, contents: Buffer): Promise<DaemonProcessState> {
    try {
      Logger.info('Finalizing daemon %s with %d bytes', path, contents.length);
      const inStat: DaemonProcessState = await DaemonUtil.stat(s3Cache, path);
      inStat.completedEpochMS = new Date().getTime();
      inStat.lastUpdatedMessage = 'Complete';

      return DaemonUtil.writeState(s3Cache, path, inStat, contents);
    } catch (err) {
      Logger.error('Error while trying to finalize a daemon: %j %s', path, err);
      throw err;
    }
  }
}

import { EnvironmentServiceProvider } from './environment-service-provider.js';
import { S3CacheRatchet } from '../s3/s3-cache-ratchet.js';
import { RequireRatchet } from '@bitblit/ratchet-common/dist/lang/require-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/dist/logger/logger.js';
import { StringRatchet } from '@bitblit/ratchet-common/dist/lang/string-ratchet.js';
import { StopWatch } from '@bitblit/ratchet-common/dist/lang/stop-watch.js';
import { S3Client } from '@aws-sdk/client-s3';

/**
 * Service for reading environmental variables from S3
 */
export class S3EnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  private ratchet: S3CacheRatchet;

  public constructor(private cfg: S3EnvironmentServiceProviderConfig) {
    RequireRatchet.notNullOrUndefined(cfg);
    RequireRatchet.notNullOrUndefined(cfg.bucketName);
    RequireRatchet.notNullOrUndefined(cfg.region);
    RequireRatchet.true(!!cfg.s3Override || !!cfg.region, 'You must set either region or S3Override');
    const s3: S3Client = cfg.s3Override || new S3Client({ region: cfg.region });
    this.ratchet = new S3CacheRatchet(s3, cfg.bucketName);
  }

  public async fetchConfig(name: string): Promise<T> {
    const readPath: string = StringRatchet.trimToEmpty(this.cfg.pathPrefix) + name + StringRatchet.trimToEmpty(this.cfg.pathSuffix);
    Logger.silly('S3EnvironmentServiceProvider:Request to read config from : %s / %s', this.cfg.bucketName, readPath);
    const sw: StopWatch = new StopWatch();
    const rval: T = await this.ratchet.fetchCacheFileAsObject<T>(readPath);
    sw.log();
    return rval;
  }
}

export interface S3EnvironmentServiceProviderConfig {
  s3Override?: S3Client;
  bucketName: string;
  region?: string;
  pathPrefix?: string;
  pathSuffix?: string;
}

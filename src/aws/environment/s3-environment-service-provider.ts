import AWS from 'aws-sdk';
import { ClientConfiguration } from 'aws-sdk/clients/s3';
import { EnvironmentServiceProvider } from './environment-service-provider.js';
import { S3CacheRatchet } from '../s3-cache-ratchet.js';
import { RequireRatchet } from '../../common/require-ratchet.js';
import { StopWatch } from '../../common/stop-watch.js';
import { Logger } from '../../common/logger.js';
import { StringRatchet } from '../../common/string-ratchet.js';

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
    const s3: AWS.S3 = cfg.s3Override || new AWS.S3({ region: cfg.region } as ClientConfiguration);
    this.ratchet = new S3CacheRatchet(s3, cfg.bucketName);
  }

  public async fetchConfig(name: string): Promise<T> {
    const readPath: string = StringRatchet.trimToEmpty(this.cfg.pathPrefix) + name + StringRatchet.trimToEmpty(this.cfg.pathSuffix);
    Logger.silly('S3EnvironmentServiceProvider:Request to read config from : %s / %s', this.cfg.bucketName, readPath);
    const sw: StopWatch = new StopWatch();
    sw.start();
    const rval: T = await this.ratchet.readCacheFileToObject<T>(readPath);
    return rval;
  }
}

export interface S3EnvironmentServiceProviderConfig {
  s3Override?: AWS.S3;
  bucketName: string;
  region?: string;
  pathPrefix?: string;
  pathSuffix?: string;
}

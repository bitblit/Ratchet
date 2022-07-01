import AWS from 'aws-sdk';
import { ErrorRatchet, Logger, PromiseRatchet, RequireRatchet, StopWatch } from '../../common';
import { S3CacheRatchet } from '../s3-cache-ratchet';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class S3EnvironmentService {
  private static READ_CONFIG_PROMISE: Map<string, Promise<any>> = new Map();

  public constructor(private s3: AWS.S3) {}

  public async getConfig(bucketName: string, path: string): Promise<any> {
    RequireRatchet.notNullOrUndefined(bucketName);
    RequireRatchet.notNullOrUndefined(path);
    const storeKey: string = 's3://' + bucketName + '/' + path;
    Logger.silly('EnvService:Request to read config from : %s', storeKey);
    if (S3EnvironmentService.READ_CONFIG_PROMISE.has(storeKey)) {
      Logger.silly('Using previous EnvService promise');
    } else {
      Logger.debug('Created new EnvService promise (for %s) and registered, returning', storeKey);
      S3EnvironmentService.READ_CONFIG_PROMISE.set(storeKey, this.retryingGetParams(bucketName, path, 4, 2000));
    }
    return S3EnvironmentService.READ_CONFIG_PROMISE.get(storeKey);
  }

  private async retryingGetParams(bucketName: string, path: string, maxRetries: number, backoffMultiplierMS: number): Promise<any> {
    Logger.silly('Creating new EnvService promise for s3 : %s / %s', bucketName, path);
    const sw: StopWatch = new StopWatch();
    sw.start();
    const ratchet: S3CacheRatchet = new S3CacheRatchet(this.s3, bucketName);

    let tryCount = 0;
    let parsedValue: any = null;

    while (!parsedValue && tryCount < maxRetries) {
      tryCount++;
      try {
        parsedValue = await ratchet.readCacheFileToObject<any>(path);
      } catch (err) {
        const errCode: string = err['code'] || '';
        await PromiseRatchet.wait(backoffMultiplierMS * tryCount);
        // TODO: Recoverable errors would go here
        Logger.error('Final environment fetch error (code: %s) (cannot retry) : %s', errCode, err, err);
        throw err;
      }
    }

    // If we reach here with a string result, try to parse it
    if (!!parsedValue) {
      sw.stop();
      Logger.debug('Loaded params : %s', sw.dump());
      return parsedValue;
    } else {
      ErrorRatchet.throwFormattedErr('Could not find system parameter in s3 at %s / %s in this account', bucketName, path);
    }
  }
}

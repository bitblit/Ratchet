import * as AWS from 'aws-sdk';
import { Logger } from '../common/logger';
import { GetParameterResult } from 'aws-sdk/clients/ssm';
import { AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { PromiseRatchet } from '../common/promise-ratchet';
import { RequireRatchet } from '../common/require-ratchet';
import { ClientConfiguration } from 'aws-sdk/clients/s3';
import { S3CacheRatchet } from './s3-cache-ratchet';
import { ErrorRatchet } from '../common/error-ratchet';
import { StopWatch } from '../common/stop-watch';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class EnvironmentService {
  private static READ_CONFIG_PROMISE: Map<string, Promise<any>> = new Map();

  private constructor() {
    // Private so we don't instantiate this guy
  }

  public static async getConfig(name: string, region = 'us-east-1', ssmEncrypted = true): Promise<any> {
    Logger.silly('EnvService:Request to read config');
    if (EnvironmentService.READ_CONFIG_PROMISE.get(name)) {
      Logger.silly('Using previous EnvService promise');
    } else {
      Logger.debug('Created new EnvService promise (for %s) and registered, returning', name);
      EnvironmentService.READ_CONFIG_PROMISE.set(name, this.retryingGetParamsSSM(name, region, ssmEncrypted, 4, 2000));
    }
    return EnvironmentService.READ_CONFIG_PROMISE.get(name);
  }

  // Alternative method that fetches config from S3 instead
  public static async getConfigS3(bucketName: string, path: string, region = 'us-east-1'): Promise<any> {
    RequireRatchet.notNullOrUndefined(bucketName);
    RequireRatchet.notNullOrUndefined(path);
    const storeKey: string = 's3://' + bucketName + '/' + path;
    Logger.silly('EnvService:Request to read config from : %s', storeKey);
    if (EnvironmentService.READ_CONFIG_PROMISE.has(storeKey)) {
      Logger.silly('Using previous EnvService promise');
    } else {
      Logger.debug('Created new EnvService promise (for %s) and registered, returning', storeKey);
      EnvironmentService.READ_CONFIG_PROMISE.set(storeKey, this.retryingGetParamsS3(bucketName, path, region, 4, 2000));
    }
    return EnvironmentService.READ_CONFIG_PROMISE.get(storeKey);
  }

  private static async retryingGetParamsS3(
    bucketName: string,
    path: string,
    region = 'us-east-1',
    maxRetries: number,
    backoffMultiplierMS: number
  ): Promise<any> {
    Logger.silly('Creating new EnvService promise for s3 : %s / %s', bucketName, path);
    const sw: StopWatch = new StopWatch();
    sw.start();
    const s3: AWS.S3 = new AWS.S3({ region: region } as ClientConfiguration);
    const ratchet: S3CacheRatchet = new S3CacheRatchet(s3, bucketName);

    let tryCount = 0;
    let parsedValue: any = null;

    while (!parsedValue && tryCount < maxRetries) {
      tryCount++;
      try {
        parsedValue = await ratchet.readCacheFileToObject<any>(path);
      } catch (err) {
        const errCode: string = err.code || '';
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

  private static async retryingGetParamsSSM(
    name: string,
    region = 'us-east-1',
    ssmEncrypted = true,
    maxRetries: number,
    backoffMultiplierMS: number
  ): Promise<any> {
    Logger.silly('Creating new EnvService promise for %s', name);
    const ssm = new AWS.SSM({ apiVersion: '2014-11-06', region: region });
    const params = {
      Name: name /* required */,
      WithDecryption: ssmEncrypted,
    };

    let tryCount = 0;
    let toParse: string = null;

    while (!toParse && tryCount < maxRetries) {
      tryCount++;
      try {
        const value: PromiseResult<GetParameterResult, AWSError> = await ssm.getParameter(params).promise();
        toParse = value && value.Parameter && value.Parameter.Value;
      } catch (err) {
        const errCode: string = err.code || '';
        if (errCode.toLowerCase().indexOf('throttlingexception') !== -1) {
          const wait: number = backoffMultiplierMS * tryCount;
          Logger.warn('Throttled while trying to read parameters - waiting %d ms and retrying (attempt %d)', wait, tryCount);
          await PromiseRatchet.wait(wait);
        } else if (errCode.toLowerCase().indexOf('parameternotfound') !== -1) {
          const errMsg: string = Logger.warn('AWS could not find parameter %s - are you using the right AWS key?', name);
          throw new Error(errMsg);
        } else {
          Logger.error('Final environment fetch error (cannot retry) : %s', err, err);
          throw err;
        }
      }
    }

    // If we reach here with a string result, try to parse it
    if (!!toParse) {
      try {
        const rval: any = JSON.parse(toParse);
        return rval;
      } catch (err) {
        Logger.error('Failed to read env - null or invalid JSON : %s : %s', err, toParse, err);
        throw err;
      }
    } else {
      throw new Error('Could not find system parameter with name : ' + name + ' in this account');
    }
  }
}

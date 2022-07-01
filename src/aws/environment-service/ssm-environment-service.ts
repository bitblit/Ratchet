import AWS from 'aws-sdk';
import { GetParameterResult } from 'aws-sdk/clients/ssm';
import { AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Logger, PromiseRatchet } from '../../common';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class SsmEnvironmentService {
  private static READ_CONFIG_PROMISE: Map<string, Promise<any>> = new Map();

  public constructor(private ssm: AWS.SSM) {}

  public async getConfig(name: string, ssmEncrypted = true): Promise<any> {
    Logger.silly('EnvService:Request to read config');
    if (SsmEnvironmentService.READ_CONFIG_PROMISE.get(name)) {
      Logger.silly('Using previous EnvService promise');
    } else {
      Logger.debug('Created new EnvService promise (for %s) and registered, returning', name);
      SsmEnvironmentService.READ_CONFIG_PROMISE.set(name, this.retryingGetParams(name, ssmEncrypted, 4, 2000));
    }
    return SsmEnvironmentService.READ_CONFIG_PROMISE.get(name);
  }

  private async retryingGetParams(name: string, ssmEncrypted = true, maxRetries: number, backoffMultiplierMS: number): Promise<any> {
    Logger.silly('Creating new EnvService promise for %s', name);
    const params = {
      Name: name /* required */,
      WithDecryption: ssmEncrypted,
    };

    let tryCount = 0;
    let toParse: string = null;

    while (!toParse && tryCount < maxRetries) {
      tryCount++;
      try {
        const value: PromiseResult<GetParameterResult, AWSError> = await this.ssm.getParameter(params).promise();
        toParse = value && value.Parameter && value.Parameter.Value;
      } catch (err) {
        const errCode: string = err['code'] || '';
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

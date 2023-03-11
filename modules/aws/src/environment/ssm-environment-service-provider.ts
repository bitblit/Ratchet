import { Logger } from '@bitblit/ratchet-common';
import { GetParameterCommand, GetParameterCommandOutput, SSMClient } from '@aws-sdk/client-ssm';
import { PromiseRatchet } from '@bitblit/ratchet-common';
import { RequireRatchet } from '@bitblit/ratchet-common';
import { ErrorRatchet } from '@bitblit/ratchet-common';
import { EnvironmentServiceProvider } from './environment-service-provider';
import { StringRatchet } from '@bitblit/ratchet-common';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class SsmEnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  private ssm: SSMClient;
  public constructor(private region = 'us-east-1', private ssmEncrypted = true) {
    RequireRatchet.notNullOrUndefined(region);
    RequireRatchet.notNullOrUndefined(ssmEncrypted);
    this.ssm = new SSMClient({ region: this.region });
  }

  public async fetchConfig(name: string): Promise<T> {
    Logger.silly('SsmEnvironmentServiceProvider fetch for %s', name);
    const params = {
      Name: name /* required */,
      WithDecryption: this.ssmEncrypted,
    };

    let rval: T = null;
    let toParse: string = null;
    try {
      const value: GetParameterCommandOutput = await this.ssm.send(new GetParameterCommand(params));
      toParse = StringRatchet.trimToNull(value?.Parameter?.Value);
    } catch (err) {
      const errCode: string = err['code'] || '';
      if (errCode.toLowerCase().indexOf('throttlingexception') !== -1) {
        Logger.warn('Throttled while trying to read parameters - waiting 1 second before allowing retry');
        await PromiseRatchet.wait(1_000);
      } else if (errCode.toLowerCase().indexOf('parameternotfound') !== -1) {
        const errMsg: string = Logger.warn('AWS could not find parameter %s - are you using the right AWS key?', name);
        throw new Error(errMsg);
      } else {
        Logger.error('Final environment fetch error (cannot retry) : %s', err, err);
        throw err;
      }
    }

    // If we reach here with a string result, try to parse it
    if (toParse) {
      try {
        rval = JSON.parse(toParse);
      } catch (err) {
        Logger.error('Failed to read env - null or invalid JSON : %s : %s', err, toParse, err);
        throw err;
      }
    } else {
      ErrorRatchet.throwFormattedErr('Could not find system parameter with name : %s in this account', name);
    }
    return rval;
  }
}

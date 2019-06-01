import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';
import {GetParameterResult} from 'aws-sdk/clients/ssm';
import {AWSError} from 'aws-sdk';
import {PromiseResult} from 'aws-sdk/lib/request';
import {PromiseRatchet} from '../common/promise-ratchet';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class EnvironmentService {
    private static READ_CONFIG_PROMISE: Map<String, Promise<any>> = new Map();

    private constructor() {
        // Private so we don't instantiate this guy
    }

    public static async getConfig(name: string, region: string = 'us-east-1', ssmEncrypted: boolean = true): Promise<any> {
        Logger.silly('EnvService:Request to read config');
        if (EnvironmentService.READ_CONFIG_PROMISE.get(name)) {
            Logger.silly('Using previous EnvService promise');
        } else {
            Logger.debug('Created new EnvService promise (for %s) and registered, returning', name);
            EnvironmentService.READ_CONFIG_PROMISE.set(name, this.retryingGetParams(name, region, ssmEncrypted, 4, 2000));
        }
        return EnvironmentService.READ_CONFIG_PROMISE.get(name);
    }

    private static async retryingGetParams(name: string, region: string = 'us-east-1', ssmEncrypted: boolean = true,
                                           maxRetries: number, backoffMultiplierMS: number):Promise<any> {
        Logger.silly('Creating new EnvService promise for %s', name);
        const ssm = new AWS.SSM({apiVersion: '2014-11-06', region: region});
        const params = {
            Name: name, /* required */
            WithDecryption: ssmEncrypted
        };

        let tryCount: number = 0;
        let toParse: string = null;

        while (!toParse && tryCount<maxRetries) {
            tryCount++;
            try {
                const value: PromiseResult<GetParameterResult, AWSError> = await ssm.getParameter(params).promise();
                toParse = value && value.Parameter && value.Parameter.Value;
            } catch (err) {
                const errCode: string = err.code || '';
                if (errCode.toLowerCase().indexOf('throttlingexception')!==-1) {
                    const wait: number = backoffMultiplierMS * tryCount;
                    Logger.warn('Throttled while trying to read parameters - waiting %d ms and retrying (attempt %d)', wait, tryCount);
                    await PromiseRatchet.wait(wait);
                } else {
                    Logger.error('Final environment fetch error (cannot retry) : %s',err,err);
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
            throw new Error('Could not find system parameter with name : '+name+' in this account');
        }

    }

}

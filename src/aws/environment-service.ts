import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class EnvironmentService {
    private static READ_CONFIG_PROMISE: Map<String,Promise<any>> = new Map();

    public static getConfig(name:string, region:string = 'us-east-1', ssmEncrypted : boolean = true): Promise<any> {
        Logger.info('EnvService:About to read config');
        if (EnvironmentService.READ_CONFIG_PROMISE.get(name)) {
            Logger.debug('Using previous EnvService promise');
            return Promise.resolve(EnvironmentService.READ_CONFIG_PROMISE.get(name));
        } else {
            Logger.debug('Creating new EnvService promise');
            const ssm = new AWS.SSM({apiVersion: '2014-11-06', region: region});
            const params = {
                Name: name, /* required */
                WithDecryption: ssmEncrypted
            };

            EnvironmentService.READ_CONFIG_PROMISE.set(name, ssm.getParameter(params).promise().then(value => {
                Logger.info('EnvService:Finished read config');

                if (value != null && value.Parameter != null && value.Parameter.Value) {
                    const toParse: string = value.Parameter.Value;
                    return JSON.parse(toParse);
                } else {
                    return null;
                }
            })
            .catch(err => {
                Logger.error('Error reading environmental configuration - returning null: %s', err);
                return null;
            }));

            Logger.debug('Created new EnvService promise and registered, returning');
            return EnvironmentService.READ_CONFIG_PROMISE.get(name);
        }
    }

    private constructor() {
        // Private so we don't instantiate this guy
    }

}

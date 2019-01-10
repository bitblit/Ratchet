import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class EnvironmentService {
    private static READ_CONFIG_PROMISE: Map<String, Promise<any>> = new Map();

    private constructor() {
        // Private so we don't instantiate this guy
    }

    public static getConfig(name: string, region: string = 'us-east-1', ssmEncrypted: boolean = true): Promise<any> {
        Logger.silly('EnvService:Request to read config');
        if (EnvironmentService.READ_CONFIG_PROMISE.get(name)) {
            Logger.silly('Using previous EnvService promise');
            return Promise.resolve(EnvironmentService.READ_CONFIG_PROMISE.get(name));
        } else {
            Logger.silly('Creating new EnvService promise');
            const ssm = new AWS.SSM({apiVersion: '2014-11-06', region: region});
            const params = {
                Name: name, /* required */
                WithDecryption: ssmEncrypted
            };

            EnvironmentService.READ_CONFIG_PROMISE.set(name, ssm.getParameter(params).promise().then(value => {
                Logger.debug('EnvService:Finished read config');

                if (value != null && value.Parameter != null && value.Parameter.Value) {
                    try {
                        const toParse: string = value.Parameter.Value;
                        const rval: any = JSON.parse(toParse);
                        return rval;
                    } catch (err) {
                        Logger.error('Failed to read env - null or invalid JSON : %s : %s', err, value.Parameter.Value, err);
                        throw err;
                    }

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

}

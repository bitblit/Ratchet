import * as AWS from 'aws-sdk';
import {Logger} from "../common/logger";

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */

// Reads a configuration from the system management service and caches it for use
export class EnvironmentService {
    private ssmEntryName : string;
    private ssmRegion : string;
    private ssmEncrypted : boolean;
    private static readConfigPromise: any;

    constructor(ssmEntryName: string, ssmRegion : string = 'us-east-1', ssmEncrypted : boolean = true)
    {
        if (!ssmEntryName)
        {
            throw 'SSM Entry name cannot be null';
        }
        this.ssmEntryName = ssmEntryName;
        this.ssmRegion = ssmRegion;
        this.ssmEncrypted = ssmEncrypted;
    }

    public getConfig() : Promise<any>
    {
        Logger.info("EnvService:About to read config");
        if (EnvironmentService.readConfigPromise)
        {
            return Promise.resolve(EnvironmentService.readConfigPromise);
        }
        else {
            let ssm = new AWS.SSM({apiVersion: '2014-11-06',region: this.ssmRegion});
            let params = {
                Name: this.ssmEntryName, /* required */
                WithDecryption: this.ssmEncrypted
            };

            return ssm.getParameter(params).promise().then(value=>{
                Logger.info("EnvService:Finished reading config");

                if (value!=null && value.Parameter!=null && value.Parameter.Value)
                {
                    let toParse : string = value.Parameter.Value;
                    return JSON.parse(toParse);
                }
                else
                {
                    return null;
                }
            })
                .catch (err=>{
                    Logger.error("Error reading environmental configuration - returning null: %s",err);
                    return null;
                })
        }
    }

}

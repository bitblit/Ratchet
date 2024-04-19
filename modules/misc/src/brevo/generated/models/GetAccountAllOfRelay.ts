/* tslint:disable */
/* eslint-disable */
/**
 * SendinBlue API
 * SendinBlue provide a RESTFul API that can be used with any languages. With this API, you will be able to :   - Manage your campaigns and get the statistics   - Manage your contacts   - Send transactional Emails and SMS   - and much more...  You can download our wrappers at https://github.com/orgs/sendinblue  **Possible responses**   | Code | Message |   | :-------------: | ------------- |   | 200  | OK. Successful Request  |   | 201  | OK. Successful Creation |   | 202  | OK. Request accepted |   | 204  | OK. Successful Update/Deletion  |   | 400  | Error. Bad Request  |   | 401  | Error. Authentication Needed  |   | 402  | Error. Not enough credit, plan upgrade needed  |   | 403  | Error. Permission denied  |   | 404  | Error. Object does not exist |   | 405  | Error. Method not allowed  |   | 406  | Error. Not Acceptable  | 
 *
 * The version of the OpenAPI document: 3.0.0
 * Contact: contact@sendinblue.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime.js';
import type { GetAccountAllOfRelayData } from './GetAccountAllOfRelayData.js';
import {
    GetAccountAllOfRelayDataFromJSON,
    GetAccountAllOfRelayDataFromJSONTyped,
    GetAccountAllOfRelayDataToJSON,
} from './GetAccountAllOfRelayData.js';

/**
 * Information about your transactional email account
 * @export
 * @interface GetAccountAllOfRelay
 */
export interface GetAccountAllOfRelay {
    /**
     * Status of your transactional email Account (true=Enabled, false=Disabled)
     * @type {boolean}
     * @memberof GetAccountAllOfRelay
     */
    enabled: boolean;
    /**
     * 
     * @type {GetAccountAllOfRelayData}
     * @memberof GetAccountAllOfRelay
     */
    data: GetAccountAllOfRelayData;
}

/**
 * Check if a given object implements the GetAccountAllOfRelay interface.
 */
export function instanceOfGetAccountAllOfRelay(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "enabled" in value;
    isInstance = isInstance && "data" in value;

    return isInstance;
}

export function GetAccountAllOfRelayFromJSON(json: any): GetAccountAllOfRelay {
    return GetAccountAllOfRelayFromJSONTyped(json, false);
}

export function GetAccountAllOfRelayFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetAccountAllOfRelay {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'enabled': json['enabled'],
        'data': GetAccountAllOfRelayDataFromJSON(json['data']),
    };
}

export function GetAccountAllOfRelayToJSON(value?: GetAccountAllOfRelay | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'enabled': value.enabled,
        'data': GetAccountAllOfRelayDataToJSON(value.data),
    };
}

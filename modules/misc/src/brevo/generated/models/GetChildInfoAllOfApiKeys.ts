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
import type { GetChildInfoAllOfApiKeysV2 } from './GetChildInfoAllOfApiKeysV2.js';
import {
    GetChildInfoAllOfApiKeysV2FromJSON,
    GetChildInfoAllOfApiKeysV2FromJSONTyped,
    GetChildInfoAllOfApiKeysV2ToJSON,
} from './GetChildInfoAllOfApiKeysV2.js';
import type { GetChildInfoAllOfApiKeysV3 } from './GetChildInfoAllOfApiKeysV3.js';
import {
    GetChildInfoAllOfApiKeysV3FromJSON,
    GetChildInfoAllOfApiKeysV3FromJSONTyped,
    GetChildInfoAllOfApiKeysV3ToJSON,
} from './GetChildInfoAllOfApiKeysV3.js';

/**
 * API Keys associated to child account
 * @export
 * @interface GetChildInfoAllOfApiKeys
 */
export interface GetChildInfoAllOfApiKeys {
    /**
     * 
     * @type {Array<GetChildInfoAllOfApiKeysV2>}
     * @memberof GetChildInfoAllOfApiKeys
     */
    v2: Array<GetChildInfoAllOfApiKeysV2>;
    /**
     * 
     * @type {Array<GetChildInfoAllOfApiKeysV3>}
     * @memberof GetChildInfoAllOfApiKeys
     */
    v3?: Array<GetChildInfoAllOfApiKeysV3>;
}

/**
 * Check if a given object implements the GetChildInfoAllOfApiKeys interface.
 */
export function instanceOfGetChildInfoAllOfApiKeys(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "v2" in value;

    return isInstance;
}

export function GetChildInfoAllOfApiKeysFromJSON(json: any): GetChildInfoAllOfApiKeys {
    return GetChildInfoAllOfApiKeysFromJSONTyped(json, false);
}

export function GetChildInfoAllOfApiKeysFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetChildInfoAllOfApiKeys {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'v2': ((json['v2'] as Array<any>).map(GetChildInfoAllOfApiKeysV2FromJSON)),
        'v3': !exists(json, 'v3') ? undefined : ((json['v3'] as Array<any>).map(GetChildInfoAllOfApiKeysV3FromJSON)),
    };
}

export function GetChildInfoAllOfApiKeysToJSON(value?: GetChildInfoAllOfApiKeys | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'v2': ((value.v2 as Array<any>).map(GetChildInfoAllOfApiKeysV2ToJSON)),
        'v3': value.v3 === undefined ? undefined : ((value.v3 as Array<any>).map(GetChildInfoAllOfApiKeysV3ToJSON)),
    };
}

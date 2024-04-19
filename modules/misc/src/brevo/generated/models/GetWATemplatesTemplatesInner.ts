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
/**
 * 
 * @export
 * @interface GetWATemplatesTemplatesInner
 */
export interface GetWATemplatesTemplatesInner {
    /**
     * id of the template
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    id: string;
    /**
     * Name of the WhatsApp template
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    name: string;
    /**
     * Status of the WhatsApp template
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    status: string;
    /**
     * Language in which template exists
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    language: string;
    /**
     * category of the template
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    category: string;
    /**
     * Error reason in the template creation
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    errorReason?: string;
    /**
     * Creation UTC date-time of the whatsApp template (YYYY-MM-DDTHH:mm:ss.SSSZ)
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    createdAt: string;
    /**
     * UTC date-time of last modification of the whatsApp template (YYYY-MM-DDTHH:mm:ss.SSSZ)
     * @type {string}
     * @memberof GetWATemplatesTemplatesInner
     */
    modifiedAt: string;
}

/**
 * Check if a given object implements the GetWATemplatesTemplatesInner interface.
 */
export function instanceOfGetWATemplatesTemplatesInner(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "status" in value;
    isInstance = isInstance && "language" in value;
    isInstance = isInstance && "category" in value;
    isInstance = isInstance && "createdAt" in value;
    isInstance = isInstance && "modifiedAt" in value;

    return isInstance;
}

export function GetWATemplatesTemplatesInnerFromJSON(json: any): GetWATemplatesTemplatesInner {
    return GetWATemplatesTemplatesInnerFromJSONTyped(json, false);
}

export function GetWATemplatesTemplatesInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetWATemplatesTemplatesInner {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'status': json['status'],
        'language': json['language'],
        'category': json['category'],
        'errorReason': !exists(json, 'errorReason') ? undefined : json['errorReason'],
        'createdAt': json['createdAt'],
        'modifiedAt': json['modifiedAt'],
    };
}

export function GetWATemplatesTemplatesInnerToJSON(value?: GetWATemplatesTemplatesInner | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'status': value.status,
        'language': value.language,
        'category': value.category,
        'errorReason': value.errorReason,
        'createdAt': value.createdAt,
        'modifiedAt': value.modifiedAt,
    };
}

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

import { exists } from '../runtime.js';

/**
 *
 * @export
 * @interface CreateReseller
 */
export interface CreateReseller {
  /**
   * AuthKey of Reseller child created
   * @type {string}
   * @memberof CreateReseller
   */
  authKey: string;
  /**
   * Id of Reseller child created
   * @type {number}
   * @memberof CreateReseller
   */
  id?: number;
}

/**
 * Check if a given object implements the CreateReseller interface.
 */
export function instanceOfCreateReseller(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'authKey' in value;

  return isInstance;
}

export function CreateResellerFromJSON(json: any): CreateReseller {
  return CreateResellerFromJSONTyped(json, false);
}

export function CreateResellerFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateReseller {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    authKey: json['authKey'],
    id: !exists(json, 'id') ? undefined : json['id'],
  };
}

export function CreateResellerToJSON(value?: CreateReseller | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    authKey: value.authKey,
    id: value.id,
  };
}

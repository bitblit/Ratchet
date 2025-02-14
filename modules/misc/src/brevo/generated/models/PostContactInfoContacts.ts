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
 * @interface PostContactInfoContacts
 */
export interface PostContactInfoContacts {
  /**
   *
   * @type {Array<string>}
   * @memberof PostContactInfoContacts
   */
  success?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof PostContactInfoContacts
   */
  failure?: Array<string>;
  /**
   * Displays the count of total number of contacts removed from list when user opts for "all" option.
   * @type {number}
   * @memberof PostContactInfoContacts
   */
  total?: number;
  /**
   * Id of the process created to remove contacts from list when user opts for "all" option.
   * @type {number}
   * @memberof PostContactInfoContacts
   */
  processId?: number;
}

/**
 * Check if a given object implements the PostContactInfoContacts interface.
 */
export function instanceOfPostContactInfoContacts(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function PostContactInfoContactsFromJSON(json: any): PostContactInfoContacts {
  return PostContactInfoContactsFromJSONTyped(json, false);
}

export function PostContactInfoContactsFromJSONTyped(json: any, ignoreDiscriminator: boolean): PostContactInfoContacts {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    success: !exists(json, 'success') ? undefined : json['success'],
    failure: !exists(json, 'failure') ? undefined : json['failure'],
    total: !exists(json, 'total') ? undefined : json['total'],
    processId: !exists(json, 'processId') ? undefined : json['processId'],
  };
}

export function PostContactInfoContactsToJSON(value?: PostContactInfoContacts | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    success: value.success,
    failure: value.failure,
    total: value.total,
    processId: value.processId,
  };
}

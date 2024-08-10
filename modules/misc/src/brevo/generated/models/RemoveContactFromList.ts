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
 * @interface RemoveContactFromList
 */
export interface RemoveContactFromList {
  /**
   * Required if 'all' is false. Emails to remove from a list. You can pass a maximum of 150 emails for removal in one request.
   * @type {Array<string>}
   * @memberof RemoveContactFromList
   */
  emails?: Array<string>;
  /**
   * Required if 'emails' is empty. Remove all existing contacts from a list. A process will be created in this scenario. You can fetch the process details to know about the progress
   * @type {boolean}
   * @memberof RemoveContactFromList
   */
  all?: boolean;
}

/**
 * Check if a given object implements the RemoveContactFromList interface.
 */
export function instanceOfRemoveContactFromList(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function RemoveContactFromListFromJSON(json: any): RemoveContactFromList {
  return RemoveContactFromListFromJSONTyped(json, false);
}

export function RemoveContactFromListFromJSONTyped(json: any, ignoreDiscriminator: boolean): RemoveContactFromList {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    emails: !exists(json, 'emails') ? undefined : json['emails'],
    all: !exists(json, 'all') ? undefined : json['all'],
  };
}

export function RemoveContactFromListToJSON(value?: RemoveContactFromList | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    emails: value.emails,
    all: value.all,
  };
}

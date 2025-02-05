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

import type { GetListsListsInner } from './GetListsListsInner.js';
import { GetListsListsInnerFromJSON, GetListsListsInnerToJSON } from './GetListsListsInner.js';

/**
 *
 * @export
 * @interface GetLists
 */
export interface GetLists {
  /**
   * Listing of all the lists available in your account
   * @type {Array<GetListsListsInner>}
   * @memberof GetLists
   */
  lists: Array<GetListsListsInner>;
  /**
   * Number of lists in your account
   * @type {number}
   * @memberof GetLists
   */
  count: number;
}

/**
 * Check if a given object implements the GetLists interface.
 */
export function instanceOfGetLists(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'lists' in value;
  isInstance = isInstance && 'count' in value;

  return isInstance;
}

export function GetListsFromJSON(json: any): GetLists {
  return GetListsFromJSONTyped(json, false);
}

export function GetListsFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetLists {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    lists: (json['lists'] as Array<any>).map(GetListsListsInnerFromJSON),
    count: json['count'],
  };
}

export function GetListsToJSON(value?: GetLists | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    lists: (value.lists as Array<any>).map(GetListsListsInnerToJSON),
    count: value.count,
  };
}

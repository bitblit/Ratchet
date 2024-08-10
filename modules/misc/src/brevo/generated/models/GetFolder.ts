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
 * @interface GetFolder
 */
export interface GetFolder {
  /**
   * ID of the folder
   * @type {number}
   * @memberof GetFolder
   */
  id: number;
  /**
   * Name of the folder
   * @type {string}
   * @memberof GetFolder
   */
  name: string;
  /**
   * Number of blacklisted contacts in the folder
   * @type {number}
   * @memberof GetFolder
   */
  totalBlacklisted: number;
  /**
   * Number of contacts in the folder
   * @type {number}
   * @memberof GetFolder
   */
  totalSubscribers: number;
  /**
   * Number of unique contacts in the folder
   * @type {number}
   * @memberof GetFolder
   */
  uniqueSubscribers: number;
}

/**
 * Check if a given object implements the GetFolder interface.
 */
export function instanceOfGetFolder(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'id' in value;
  isInstance = isInstance && 'name' in value;
  isInstance = isInstance && 'totalBlacklisted' in value;
  isInstance = isInstance && 'totalSubscribers' in value;
  isInstance = isInstance && 'uniqueSubscribers' in value;

  return isInstance;
}

export function GetFolderFromJSON(json: any): GetFolder {
  return GetFolderFromJSONTyped(json, false);
}

export function GetFolderFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetFolder {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    name: json['name'],
    totalBlacklisted: json['totalBlacklisted'],
    totalSubscribers: json['totalSubscribers'],
    uniqueSubscribers: json['uniqueSubscribers'],
  };
}

export function GetFolderToJSON(value?: GetFolder | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    totalBlacklisted: value.totalBlacklisted,
    totalSubscribers: value.totalSubscribers,
    uniqueSubscribers: value.uniqueSubscribers,
  };
}

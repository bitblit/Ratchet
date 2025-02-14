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
import type { GetChildInfoAllOfApiKeys } from './GetChildInfoAllOfApiKeys.js';
import { GetChildInfoAllOfApiKeysFromJSON, GetChildInfoAllOfApiKeysToJSON } from './GetChildInfoAllOfApiKeys.js';
import type { GetChildInfoAllOfCredits } from './GetChildInfoAllOfCredits.js';
import { GetChildInfoAllOfCreditsFromJSON, GetChildInfoAllOfCreditsToJSON } from './GetChildInfoAllOfCredits.js';
import type { GetChildInfoAllOfStatistics } from './GetChildInfoAllOfStatistics.js';
import { GetChildInfoAllOfStatisticsFromJSON, GetChildInfoAllOfStatisticsToJSON } from './GetChildInfoAllOfStatistics.js';

/**
 *
 * @export
 * @interface GetChildInfo
 */
export interface GetChildInfo {
  /**
   * Login Email
   * @type {string}
   * @memberof GetChildInfo
   */
  email: string;
  /**
   * First Name
   * @type {string}
   * @memberof GetChildInfo
   */
  firstName: string;
  /**
   * Last Name
   * @type {string}
   * @memberof GetChildInfo
   */
  lastName: string;
  /**
   * Name of the company
   * @type {string}
   * @memberof GetChildInfo
   */
  companyName: string;
  /**
   *
   * @type {GetChildInfoAllOfCredits}
   * @memberof GetChildInfo
   */
  credits?: GetChildInfoAllOfCredits;
  /**
   *
   * @type {GetChildInfoAllOfStatistics}
   * @memberof GetChildInfo
   */
  statistics?: GetChildInfoAllOfStatistics;
  /**
   * The encrypted password of child account
   * @type {string}
   * @memberof GetChildInfo
   */
  password: string;
  /**
   * IP(s) associated to a child account user
   * @type {Array<string>}
   * @memberof GetChildInfo
   */
  ips?: Array<string>;
  /**
   *
   * @type {GetChildInfoAllOfApiKeys}
   * @memberof GetChildInfo
   */
  apiKeys?: GetChildInfoAllOfApiKeys;
}

/**
 * Check if a given object implements the GetChildInfo interface.
 */
export function instanceOfGetChildInfo(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'email' in value;
  isInstance = isInstance && 'firstName' in value;
  isInstance = isInstance && 'lastName' in value;
  isInstance = isInstance && 'companyName' in value;
  isInstance = isInstance && 'password' in value;

  return isInstance;
}

export function GetChildInfoFromJSON(json: any): GetChildInfo {
  return GetChildInfoFromJSONTyped(json, false);
}

export function GetChildInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetChildInfo {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    email: json['email'],
    firstName: json['firstName'],
    lastName: json['lastName'],
    companyName: json['companyName'],
    credits: !exists(json, 'credits') ? undefined : GetChildInfoAllOfCreditsFromJSON(json['credits']),
    statistics: !exists(json, 'statistics') ? undefined : GetChildInfoAllOfStatisticsFromJSON(json['statistics']),
    password: json['password'],
    ips: !exists(json, 'ips') ? undefined : json['ips'],
    apiKeys: !exists(json, 'apiKeys') ? undefined : GetChildInfoAllOfApiKeysFromJSON(json['apiKeys']),
  };
}

export function GetChildInfoToJSON(value?: GetChildInfo | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
    companyName: value.companyName,
    credits: GetChildInfoAllOfCreditsToJSON(value.credits),
    statistics: GetChildInfoAllOfStatisticsToJSON(value.statistics),
    password: value.password,
    ips: value.ips,
    apiKeys: GetChildInfoAllOfApiKeysToJSON(value.apiKeys),
  };
}

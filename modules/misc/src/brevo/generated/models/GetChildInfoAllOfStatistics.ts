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
 * Statistics about your child account activity
 * @export
 * @interface GetChildInfoAllOfStatistics
 */
export interface GetChildInfoAllOfStatistics {
  /**
   * Overall emails sent for the previous month
   * @type {number}
   * @memberof GetChildInfoAllOfStatistics
   */
  previousMonthTotalSent?: number;
  /**
   * Overall emails sent for current month
   * @type {number}
   * @memberof GetChildInfoAllOfStatistics
   */
  currentMonthTotalSent?: number;
  /**
   * Overall emails sent for since the account exists
   * @type {number}
   * @memberof GetChildInfoAllOfStatistics
   */
  totalSent?: number;
}

/**
 * Check if a given object implements the GetChildInfoAllOfStatistics interface.
 */
export function instanceOfGetChildInfoAllOfStatistics(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function GetChildInfoAllOfStatisticsFromJSON(json: any): GetChildInfoAllOfStatistics {
  return GetChildInfoAllOfStatisticsFromJSONTyped(json, false);
}

export function GetChildInfoAllOfStatisticsFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetChildInfoAllOfStatistics {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    previousMonthTotalSent: !exists(json, 'previousMonthTotalSent') ? undefined : json['previousMonthTotalSent'],
    currentMonthTotalSent: !exists(json, 'currentMonthTotalSent') ? undefined : json['currentMonthTotalSent'],
    totalSent: !exists(json, 'totalSent') ? undefined : json['totalSent'],
  };
}

export function GetChildInfoAllOfStatisticsToJSON(value?: GetChildInfoAllOfStatistics | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    previousMonthTotalSent: value.previousMonthTotalSent,
    currentMonthTotalSent: value.currentMonthTotalSent,
    totalSent: value.totalSent,
  };
}

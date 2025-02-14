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
 * Listing of all the segments available in your account
 * @export
 * @interface GetSegmentsSegments
 */
export interface GetSegmentsSegments {
  /**
   * ID of the list
   * @type {number}
   * @memberof GetSegmentsSegments
   */
  id?: number;
  /**
   * Name of the Segment
   * @type {string}
   * @memberof GetSegmentsSegments
   */
  segmentName?: string;
  /**
   * Name of the Segment Category
   * @type {string}
   * @memberof GetSegmentsSegments
   */
  categoryName?: string;
  /**
   * Updation UTC date-time of the segment (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {string}
   * @memberof GetSegmentsSegments
   */
  updatedAt?: string;
}

/**
 * Check if a given object implements the GetSegmentsSegments interface.
 */
export function instanceOfGetSegmentsSegments(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function GetSegmentsSegmentsFromJSON(json: any): GetSegmentsSegments {
  return GetSegmentsSegmentsFromJSONTyped(json, false);
}

export function GetSegmentsSegmentsFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetSegmentsSegments {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: !exists(json, 'id') ? undefined : json['id'],
    segmentName: !exists(json, 'segmentName') ? undefined : json['segmentName'],
    categoryName: !exists(json, 'categoryName') ? undefined : json['categoryName'],
    updatedAt: !exists(json, 'updatedAt') ? undefined : json['updatedAt'],
  };
}

export function GetSegmentsSegmentsToJSON(value?: GetSegmentsSegments | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    segmentName: value.segmentName,
    categoryName: value.categoryName,
    updatedAt: value.updatedAt,
  };
}

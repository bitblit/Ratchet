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

/**
 *
 * @export
 * @interface GetExtendedContactDetailsAllOfStatisticsOpened
 */
export interface GetExtendedContactDetailsAllOfStatisticsOpened {
  /**
   * ID of the campaign which generated the event
   * @type {number}
   * @memberof GetExtendedContactDetailsAllOfStatisticsOpened
   */
  campaignId: number;
  /**
   * Number of openings for the campaign
   * @type {number}
   * @memberof GetExtendedContactDetailsAllOfStatisticsOpened
   */
  count: number;
  /**
   * UTC date-time of the event
   * @type {Date}
   * @memberof GetExtendedContactDetailsAllOfStatisticsOpened
   */
  eventTime: Date;
  /**
   * IP from which the user has opened the email
   * @type {string}
   * @memberof GetExtendedContactDetailsAllOfStatisticsOpened
   */
  ip: string;
}

/**
 * Check if a given object implements the GetExtendedContactDetailsAllOfStatisticsOpened interface.
 */
export function instanceOfGetExtendedContactDetailsAllOfStatisticsOpened(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'campaignId' in value;
  isInstance = isInstance && 'count' in value;
  isInstance = isInstance && 'eventTime' in value;
  isInstance = isInstance && 'ip' in value;

  return isInstance;
}

export function GetExtendedContactDetailsAllOfStatisticsOpenedFromJSON(json: any): GetExtendedContactDetailsAllOfStatisticsOpened {
  return GetExtendedContactDetailsAllOfStatisticsOpenedFromJSONTyped(json, false);
}

export function GetExtendedContactDetailsAllOfStatisticsOpenedFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): GetExtendedContactDetailsAllOfStatisticsOpened {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    campaignId: json['campaignId'],
    count: json['count'],
    eventTime: new Date(json['eventTime']),
    ip: json['ip'],
  };
}

export function GetExtendedContactDetailsAllOfStatisticsOpenedToJSON(value?: GetExtendedContactDetailsAllOfStatisticsOpened | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    campaignId: value.campaignId,
    count: value.count,
    eventTime: value.eventTime.toISOString(),
    ip: value.ip,
  };
}

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
 * @interface GetReportsReportsInner
 */
export interface GetReportsReportsInner {
  /**
   * Date of the statistics
   * @type {Date}
   * @memberof GetReportsReportsInner
   */
  date: Date;
  /**
   * Number of requests for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  requests: number;
  /**
   * Number of delivered emails for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  delivered: number;
  /**
   * Number of hardbounces for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  hardBounces: number;
  /**
   * Number of softbounces for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  softBounces: number;
  /**
   * Number of clicks for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  clicks: number;
  /**
   * Number of unique clicks for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  uniqueClicks: number;
  /**
   * Number of openings for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  opens: number;
  /**
   * Number of unique openings for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  uniqueOpens: number;
  /**
   * Number of complaints (spam reports) for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  spamReports: number;
  /**
   * Number of blocked emails for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  blocked: number;
  /**
   * Number of invalid emails for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  invalid: number;
  /**
   * Number of unsubscribed emails for the date
   * @type {number}
   * @memberof GetReportsReportsInner
   */
  unsubscribed: number;
}

/**
 * Check if a given object implements the GetReportsReportsInner interface.
 */
export function instanceOfGetReportsReportsInner(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'date' in value;
  isInstance = isInstance && 'requests' in value;
  isInstance = isInstance && 'delivered' in value;
  isInstance = isInstance && 'hardBounces' in value;
  isInstance = isInstance && 'softBounces' in value;
  isInstance = isInstance && 'clicks' in value;
  isInstance = isInstance && 'uniqueClicks' in value;
  isInstance = isInstance && 'opens' in value;
  isInstance = isInstance && 'uniqueOpens' in value;
  isInstance = isInstance && 'spamReports' in value;
  isInstance = isInstance && 'blocked' in value;
  isInstance = isInstance && 'invalid' in value;
  isInstance = isInstance && 'unsubscribed' in value;

  return isInstance;
}

export function GetReportsReportsInnerFromJSON(json: any): GetReportsReportsInner {
  return GetReportsReportsInnerFromJSONTyped(json, false);
}

export function GetReportsReportsInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetReportsReportsInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    date: new Date(json['date']),
    requests: json['requests'],
    delivered: json['delivered'],
    hardBounces: json['hardBounces'],
    softBounces: json['softBounces'],
    clicks: json['clicks'],
    uniqueClicks: json['uniqueClicks'],
    opens: json['opens'],
    uniqueOpens: json['uniqueOpens'],
    spamReports: json['spamReports'],
    blocked: json['blocked'],
    invalid: json['invalid'],
    unsubscribed: json['unsubscribed'],
  };
}

export function GetReportsReportsInnerToJSON(value?: GetReportsReportsInner | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    date: value.date.toISOString().substring(0, 10),
    requests: value.requests,
    delivered: value.delivered,
    hardBounces: value.hardBounces,
    softBounces: value.softBounces,
    clicks: value.clicks,
    uniqueClicks: value.uniqueClicks,
    opens: value.opens,
    uniqueOpens: value.uniqueOpens,
    spamReports: value.spamReports,
    blocked: value.blocked,
    invalid: value.invalid,
    unsubscribed: value.unsubscribed,
  };
}

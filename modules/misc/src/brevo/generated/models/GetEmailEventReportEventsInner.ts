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
 * @interface GetEmailEventReportEventsInner
 */
export interface GetEmailEventReportEventsInner {
  /**
   * Email address which generates the event
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  email: string;
  /**
   * UTC date-time on which the event has been generated
   * @type {Date}
   * @memberof GetEmailEventReportEventsInner
   */
  date: Date;
  /**
   * Subject of the event
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  subject?: string;
  /**
   * Message ID which generated the event
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  messageId: string;
  /**
   * Event which occurred
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  event: GetEmailEventReportEventsInnerEventEnum;
  /**
   * Reason of bounce (only available if the event is hardbounce or softbounce)
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  reason?: string;
  /**
   * Tag of the email which generated the event
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  tag?: string;
  /**
   * IP from which the user has opened the email or clicked on the link (only available if the event is opened or clicks)
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  ip?: string;
  /**
   * The link which is sent to the user (only available if the event is requests or opened or clicks)
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  link?: string;
  /**
   * Sender email from which the emails are sent
   * @type {string}
   * @memberof GetEmailEventReportEventsInner
   */
  from?: string;
}

/**
 * @export
 * @enum {string}
 */
export enum GetEmailEventReportEventsInnerEventEnum {
  Bounces = 'bounces',
  HardBounces = 'hardBounces',
  SoftBounces = 'softBounces',
  Delivered = 'delivered',
  Spam = 'spam',
  Requests = 'requests',
  Opened = 'opened',
  Clicks = 'clicks',
  Invalid = 'invalid',
  Deferred = 'deferred',
  Blocked = 'blocked',
  Unsubscribed = 'unsubscribed',
}

/**
 * Check if a given object implements the GetEmailEventReportEventsInner interface.
 */
export function instanceOfGetEmailEventReportEventsInner(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'email' in value;
  isInstance = isInstance && 'date' in value;
  isInstance = isInstance && 'messageId' in value;
  isInstance = isInstance && 'event' in value;

  return isInstance;
}

export function GetEmailEventReportEventsInnerFromJSON(json: any): GetEmailEventReportEventsInner {
  return GetEmailEventReportEventsInnerFromJSONTyped(json, false);
}

export function GetEmailEventReportEventsInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetEmailEventReportEventsInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    email: json['email'],
    date: new Date(json['date']),
    subject: !exists(json, 'subject') ? undefined : json['subject'],
    messageId: json['messageId'],
    event: json['event'],
    reason: !exists(json, 'reason') ? undefined : json['reason'],
    tag: !exists(json, 'tag') ? undefined : json['tag'],
    ip: !exists(json, 'ip') ? undefined : json['ip'],
    link: !exists(json, 'link') ? undefined : json['link'],
    from: !exists(json, 'from') ? undefined : json['from'],
  };
}

export function GetEmailEventReportEventsInnerToJSON(value?: GetEmailEventReportEventsInner | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    email: value.email,
    date: value.date.toISOString(),
    subject: value.subject,
    messageId: value.messageId,
    event: value.event,
    reason: value.reason,
    tag: value.tag,
    ip: value.ip,
    link: value.link,
    from: value.from,
  };
}

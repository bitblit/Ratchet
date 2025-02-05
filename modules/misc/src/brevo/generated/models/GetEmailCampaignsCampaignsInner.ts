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
import type { GetCampaignRecipients } from './GetCampaignRecipients.js';
import { GetCampaignRecipientsFromJSON, GetCampaignRecipientsToJSON } from './GetCampaignRecipients.js';
import type { GetExtendedCampaignOverviewAllOfSender } from './GetExtendedCampaignOverviewAllOfSender.js';
import {
  GetExtendedCampaignOverviewAllOfSenderFromJSON,
  GetExtendedCampaignOverviewAllOfSenderToJSON,
} from './GetExtendedCampaignOverviewAllOfSender.js';
import type { GetExtendedCampaignStats } from './GetExtendedCampaignStats.js';
import { GetExtendedCampaignStatsFromJSON, GetExtendedCampaignStatsToJSON } from './GetExtendedCampaignStats.js';

/**
 *
 * @export
 * @interface GetEmailCampaignsCampaignsInner
 */
export interface GetEmailCampaignsCampaignsInner {
  /**
   * ID of the campaign
   * @type {number}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  id: number;
  /**
   * Name of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  name: string;
  /**
   * Subject of the campaign. Only available if `abTesting` flag of the campaign is `false`
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  subject?: string;
  /**
   * Type of campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  type: GetEmailCampaignsCampaignsInnerTypeEnum;
  /**
   * Status of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  status: GetEmailCampaignsCampaignsInnerStatusEnum;
  /**
   * UTC date-time on which campaign is scheduled (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {Date}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  scheduledAt?: Date;
  /**
   * Status of A/B Test for the campaign. abTesting = false means it is disabled, & abTesting = true means it is enabled.
   * @type {boolean}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  abTesting?: boolean;
  /**
   * Subject A of the ab-test campaign. Only available if `abTesting` flag of the campaign is `true`
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  subjectA?: string;
  /**
   * Subject B of the ab-test campaign. Only available if `abTesting` flag of the campaign is `true`
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  subjectB?: string;
  /**
   * The size of your ab-test groups. Only available if `abTesting` flag of the campaign is `true`
   * @type {number}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  splitRule?: number;
  /**
   * Criteria for the winning version. Only available if `abTesting` flag of the campaign is `true`
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  winnerCriteria?: string;
  /**
   * The duration of the test in hours at the end of which the winning version will be sent. Only available if `abTesting` flag of the campaign is `true`
   * @type {number}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  winnerDelay?: number;
  /**
   * It is true if you have chosen to send your campaign at best time, otherwise it is false
   * @type {boolean}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  sendAtBestTime?: boolean;
  /**
   * Retrieved the status of test email sending. (true=Test email has been sent  false=Test email has not been sent)
   * @type {boolean}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  testSent: boolean;
  /**
   * Header of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  header: string;
  /**
   * Footer of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  footer: string;
  /**
   *
   * @type {GetExtendedCampaignOverviewAllOfSender}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  sender: GetExtendedCampaignOverviewAllOfSender;
  /**
   * Email defined as the "Reply to" of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  replyTo: string;
  /**
   * Customisation of the "to" field of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  toField: string;
  /**
   * HTML content of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  htmlContent: string;
  /**
   * Link to share the campaign on social medias
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  shareLink?: string;
  /**
   * Tag of the campaign
   * @type {string}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  tag: string;
  /**
   * Creation UTC date-time of the campaign (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {Date}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  createdAt: Date;
  /**
   * UTC date-time of last modification of the campaign (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {Date}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  modifiedAt: Date;
  /**
   * Status of inline image. inlineImageActivation = false means image can’t be embedded, & inlineImageActivation = true means image can be embedded, in the email.
   * @type {boolean}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  inlineImageActivation?: boolean;
  /**
   * Status of mirror links in campaign. mirrorActive = false means mirror links are deactivated, & mirrorActive = true means mirror links are activated, in the campaign
   * @type {boolean}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  mirrorActive?: boolean;
  /**
   * FOR TRIGGER ONLY ! Type of trigger campaign.recurring = false means contact can receive the same Trigger campaign only once, & recurring = true means contact can receive the same Trigger campaign several times
   * @type {boolean}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  recurring?: boolean;
  /**
   * Sent UTC date-time of the campaign (YYYY-MM-DDTHH:mm:ss.SSSZ). Only available if 'status' of the campaign is 'sent'
   * @type {Date}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  sentDate?: Date;
  /**
   * Total number of non-delivered campaigns for a particular campaign id.
   * @type {number}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  returnBounce?: number;
  /**
   *
   * @type {GetCampaignRecipients}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  recipients: GetCampaignRecipients;
  /**
   *
   * @type {GetExtendedCampaignStats}
   * @memberof GetEmailCampaignsCampaignsInner
   */
  statistics: GetExtendedCampaignStats;
}

/**
 * @export
 * @enum {string}
 */
export enum GetEmailCampaignsCampaignsInnerTypeEnum {
  Classic = 'classic',
  Trigger = 'trigger',
}
/**
 * @export
 * @enum {string}
 */
export enum GetEmailCampaignsCampaignsInnerStatusEnum {
  Draft = 'draft',
  Sent = 'sent',
  Archive = 'archive',
  Queued = 'queued',
  Suspended = 'suspended',
  InProcess = 'in_process',
}

/**
 * Check if a given object implements the GetEmailCampaignsCampaignsInner interface.
 */
export function instanceOfGetEmailCampaignsCampaignsInner(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'id' in value;
  isInstance = isInstance && 'name' in value;
  isInstance = isInstance && 'type' in value;
  isInstance = isInstance && 'status' in value;
  isInstance = isInstance && 'testSent' in value;
  isInstance = isInstance && 'header' in value;
  isInstance = isInstance && 'footer' in value;
  isInstance = isInstance && 'sender' in value;
  isInstance = isInstance && 'replyTo' in value;
  isInstance = isInstance && 'toField' in value;
  isInstance = isInstance && 'htmlContent' in value;
  isInstance = isInstance && 'tag' in value;
  isInstance = isInstance && 'createdAt' in value;
  isInstance = isInstance && 'modifiedAt' in value;
  isInstance = isInstance && 'recipients' in value;
  isInstance = isInstance && 'statistics' in value;

  return isInstance;
}

export function GetEmailCampaignsCampaignsInnerFromJSON(json: any): GetEmailCampaignsCampaignsInner {
  return GetEmailCampaignsCampaignsInnerFromJSONTyped(json, false);
}

export function GetEmailCampaignsCampaignsInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetEmailCampaignsCampaignsInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    name: json['name'],
    subject: !exists(json, 'subject') ? undefined : json['subject'],
    type: json['type'],
    status: json['status'],
    scheduledAt: !exists(json, 'scheduledAt') ? undefined : new Date(json['scheduledAt']),
    abTesting: !exists(json, 'abTesting') ? undefined : json['abTesting'],
    subjectA: !exists(json, 'subjectA') ? undefined : json['subjectA'],
    subjectB: !exists(json, 'subjectB') ? undefined : json['subjectB'],
    splitRule: !exists(json, 'splitRule') ? undefined : json['splitRule'],
    winnerCriteria: !exists(json, 'winnerCriteria') ? undefined : json['winnerCriteria'],
    winnerDelay: !exists(json, 'winnerDelay') ? undefined : json['winnerDelay'],
    sendAtBestTime: !exists(json, 'sendAtBestTime') ? undefined : json['sendAtBestTime'],
    testSent: json['testSent'],
    header: json['header'],
    footer: json['footer'],
    sender: GetExtendedCampaignOverviewAllOfSenderFromJSON(json['sender']),
    replyTo: json['replyTo'],
    toField: json['toField'],
    htmlContent: json['htmlContent'],
    shareLink: !exists(json, 'shareLink') ? undefined : json['shareLink'],
    tag: json['tag'],
    createdAt: new Date(json['createdAt']),
    modifiedAt: new Date(json['modifiedAt']),
    inlineImageActivation: !exists(json, 'inlineImageActivation') ? undefined : json['inlineImageActivation'],
    mirrorActive: !exists(json, 'mirrorActive') ? undefined : json['mirrorActive'],
    recurring: !exists(json, 'recurring') ? undefined : json['recurring'],
    sentDate: !exists(json, 'sentDate') ? undefined : new Date(json['sentDate']),
    returnBounce: !exists(json, 'returnBounce') ? undefined : json['returnBounce'],
    recipients: GetCampaignRecipientsFromJSON(json['recipients']),
    statistics: GetExtendedCampaignStatsFromJSON(json['statistics']),
  };
}

export function GetEmailCampaignsCampaignsInnerToJSON(value?: GetEmailCampaignsCampaignsInner | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    subject: value.subject,
    type: value.type,
    status: value.status,
    scheduledAt: value.scheduledAt === undefined ? undefined : value.scheduledAt.toISOString(),
    abTesting: value.abTesting,
    subjectA: value.subjectA,
    subjectB: value.subjectB,
    splitRule: value.splitRule,
    winnerCriteria: value.winnerCriteria,
    winnerDelay: value.winnerDelay,
    sendAtBestTime: value.sendAtBestTime,
    testSent: value.testSent,
    header: value.header,
    footer: value.footer,
    sender: GetExtendedCampaignOverviewAllOfSenderToJSON(value.sender),
    replyTo: value.replyTo,
    toField: value.toField,
    htmlContent: value.htmlContent,
    shareLink: value.shareLink,
    tag: value.tag,
    createdAt: value.createdAt.toISOString(),
    modifiedAt: value.modifiedAt.toISOString(),
    inlineImageActivation: value.inlineImageActivation,
    mirrorActive: value.mirrorActive,
    recurring: value.recurring,
    sentDate: value.sentDate === undefined ? undefined : value.sentDate.toISOString(),
    returnBounce: value.returnBounce,
    recipients: GetCampaignRecipientsToJSON(value.recipients),
    statistics: GetExtendedCampaignStatsToJSON(value.statistics),
  };
}

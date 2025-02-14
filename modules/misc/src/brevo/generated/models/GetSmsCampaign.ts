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

import type { GetCampaignRecipients } from './GetCampaignRecipients.js';
import { GetCampaignRecipientsFromJSON, GetCampaignRecipientsToJSON } from './GetCampaignRecipients.js';
import type { GetSmsCampaignStats } from './GetSmsCampaignStats.js';
import { GetSmsCampaignStatsFromJSON, GetSmsCampaignStatsToJSON } from './GetSmsCampaignStats.js';

/**
 *
 * @export
 * @interface GetSmsCampaign
 */
export interface GetSmsCampaign {
  /**
   * ID of the SMS Campaign
   * @type {number}
   * @memberof GetSmsCampaign
   */
  id: number;
  /**
   * Name of the SMS Campaign
   * @type {string}
   * @memberof GetSmsCampaign
   */
  name: string;
  /**
   * Status of the SMS Campaign
   * @type {string}
   * @memberof GetSmsCampaign
   */
  status: GetSmsCampaignStatusEnum;
  /**
   * Content of the SMS Campaign
   * @type {string}
   * @memberof GetSmsCampaign
   */
  content: string;
  /**
   * UTC date-time on which SMS campaign is scheduled. Should be in YYYY-MM-DDTHH:mm:ss.SSSZ format
   * @type {Date}
   * @memberof GetSmsCampaign
   */
  scheduledAt: Date;
  /**
   * Sender of the SMS Campaign
   * @type {string}
   * @memberof GetSmsCampaign
   */
  sender: string;
  /**
   * Creation UTC date-time of the SMS campaign (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {Date}
   * @memberof GetSmsCampaign
   */
  createdAt: Date;
  /**
   * UTC date-time of last modification of the SMS campaign (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {Date}
   * @memberof GetSmsCampaign
   */
  modifiedAt: Date;
  /**
   *
   * @type {GetCampaignRecipients}
   * @memberof GetSmsCampaign
   */
  recipients: GetCampaignRecipients;
  /**
   *
   * @type {GetSmsCampaignStats}
   * @memberof GetSmsCampaign
   */
  statistics: GetSmsCampaignStats;
}

/**
 * @export
 * @enum {string}
 */
export enum GetSmsCampaignStatusEnum {
  Draft = 'draft',
  Sent = 'sent',
  Archive = 'archive',
  Queued = 'queued',
  Suspended = 'suspended',
  InProcess = 'inProcess',
}

/**
 * Check if a given object implements the GetSmsCampaign interface.
 */
export function instanceOfGetSmsCampaign(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'id' in value;
  isInstance = isInstance && 'name' in value;
  isInstance = isInstance && 'status' in value;
  isInstance = isInstance && 'content' in value;
  isInstance = isInstance && 'scheduledAt' in value;
  isInstance = isInstance && 'sender' in value;
  isInstance = isInstance && 'createdAt' in value;
  isInstance = isInstance && 'modifiedAt' in value;
  isInstance = isInstance && 'recipients' in value;
  isInstance = isInstance && 'statistics' in value;

  return isInstance;
}

export function GetSmsCampaignFromJSON(json: any): GetSmsCampaign {
  return GetSmsCampaignFromJSONTyped(json, false);
}

export function GetSmsCampaignFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetSmsCampaign {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    name: json['name'],
    status: json['status'],
    content: json['content'],
    scheduledAt: new Date(json['scheduledAt']),
    sender: json['sender'],
    createdAt: new Date(json['createdAt']),
    modifiedAt: new Date(json['modifiedAt']),
    recipients: GetCampaignRecipientsFromJSON(json['recipients']),
    statistics: GetSmsCampaignStatsFromJSON(json['statistics']),
  };
}

export function GetSmsCampaignToJSON(value?: GetSmsCampaign | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    status: value.status,
    content: value.content,
    scheduledAt: value.scheduledAt.toISOString(),
    sender: value.sender,
    createdAt: value.createdAt.toISOString(),
    modifiedAt: value.modifiedAt.toISOString(),
    recipients: GetCampaignRecipientsToJSON(value.recipients),
    statistics: GetSmsCampaignStatsToJSON(value.statistics),
  };
}

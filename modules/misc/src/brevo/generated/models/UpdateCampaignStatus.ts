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
 * Status of the campaign
 * @export
 * @interface UpdateCampaignStatus
 */
export interface UpdateCampaignStatus {
  /**
   * Note:- replicateTemplate status will be available only for template type campaigns.
   * @type {string}
   * @memberof UpdateCampaignStatus
   */
  status?: UpdateCampaignStatusStatusEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum UpdateCampaignStatusStatusEnum {
  Suspended = 'suspended',
  Archive = 'archive',
  Darchive = 'darchive',
  Sent = 'sent',
  Queued = 'queued',
  Replicate = 'replicate',
  ReplicateTemplate = 'replicateTemplate',
  Draft = 'draft',
}

/**
 * Check if a given object implements the UpdateCampaignStatus interface.
 */
export function instanceOfUpdateCampaignStatus(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function UpdateCampaignStatusFromJSON(json: any): UpdateCampaignStatus {
  return UpdateCampaignStatusFromJSONTyped(json, false);
}

export function UpdateCampaignStatusFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateCampaignStatus {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    status: !exists(json, 'status') ? undefined : json['status'],
  };
}

export function UpdateCampaignStatusToJSON(value?: UpdateCampaignStatus | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    status: value.status,
  };
}

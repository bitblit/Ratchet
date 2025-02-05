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
 * @interface RequestSmsRecipientExport
 */
export interface RequestSmsRecipientExport {
  /**
   * URL that will be called once the export process is finished. For reference, https://help.sendinblue.com/hc/en-us/articles/360007666479
   * @type {string}
   * @memberof RequestSmsRecipientExport
   */
  notifyURL?: string;
  /**
   * Filter the recipients based on how they interacted with the campaign
   * @type {string}
   * @memberof RequestSmsRecipientExport
   */
  recipientsType: RequestSmsRecipientExportRecipientsTypeEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum RequestSmsRecipientExportRecipientsTypeEnum {
  All = 'all',
  Delivered = 'delivered',
  Answered = 'answered',
  SoftBounces = 'softBounces',
  HardBounces = 'hardBounces',
  Unsubscribed = 'unsubscribed',
}

/**
 * Check if a given object implements the RequestSmsRecipientExport interface.
 */
export function instanceOfRequestSmsRecipientExport(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'recipientsType' in value;

  return isInstance;
}

export function RequestSmsRecipientExportFromJSON(json: any): RequestSmsRecipientExport {
  return RequestSmsRecipientExportFromJSONTyped(json, false);
}

export function RequestSmsRecipientExportFromJSONTyped(json: any, ignoreDiscriminator: boolean): RequestSmsRecipientExport {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    notifyURL: !exists(json, 'notifyURL') ? undefined : json['notifyURL'],
    recipientsType: json['recipientsType'],
  };
}

export function RequestSmsRecipientExportToJSON(value?: RequestSmsRecipientExport | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    notifyURL: value.notifyURL,
    recipientsType: value.recipientsType,
  };
}

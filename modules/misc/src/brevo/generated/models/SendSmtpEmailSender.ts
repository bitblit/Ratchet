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
 * Mandatory if 'templateId' is not passed. Pass name (optional) and email of sender from which emails will be sent. For example, {"name":"Mary from MyShop", "email":"no-reply@myshop.com"}
 * @export
 * @interface SendSmtpEmailSender
 */
export interface SendSmtpEmailSender {
  /**
   * Name of the sender from which the emails will be sent. Maximum allowed characters are 70.
   * @type {string}
   * @memberof SendSmtpEmailSender
   */
  name?: string;
  /**
   * Email of the sender from which the emails will be sent
   * @type {string}
   * @memberof SendSmtpEmailSender
   */
  email: string;
}

/**
 * Check if a given object implements the SendSmtpEmailSender interface.
 */
export function instanceOfSendSmtpEmailSender(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'email' in value;

  return isInstance;
}

export function SendSmtpEmailSenderFromJSON(json: any): SendSmtpEmailSender {
  return SendSmtpEmailSenderFromJSONTyped(json, false);
}

export function SendSmtpEmailSenderFromJSONTyped(json: any, ignoreDiscriminator: boolean): SendSmtpEmailSender {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: !exists(json, 'name') ? undefined : json['name'],
    email: json['email'],
  };
}

export function SendSmtpEmailSenderToJSON(value?: SendSmtpEmailSender | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    email: value.email,
  };
}

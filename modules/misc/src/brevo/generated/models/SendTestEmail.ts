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
 * @interface SendTestEmail
 */
export interface SendTestEmail {
  /**
   * List of the email addresses of the recipients whom you wish to send the test mail. If left empty, the test mail will be sent to your entire test list.
   * @type {Array<string>}
   * @memberof SendTestEmail
   */
  emailTo?: Array<string>;
}

/**
 * Check if a given object implements the SendTestEmail interface.
 */
export function instanceOfSendTestEmail(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function SendTestEmailFromJSON(json: any): SendTestEmail {
  return SendTestEmailFromJSONTyped(json, false);
}

export function SendTestEmailFromJSONTyped(json: any, ignoreDiscriminator: boolean): SendTestEmail {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    emailTo: !exists(json, 'emailTo') ? undefined : json['emailTo'],
  };
}

export function SendTestEmailToJSON(value?: SendTestEmail | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    emailTo: value.emailTo,
  };
}

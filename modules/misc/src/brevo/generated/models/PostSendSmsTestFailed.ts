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
 * @interface PostSendSmsTestFailed
 */
export interface PostSendSmsTestFailed {
  /**
   * Response code
   * @type {number}
   * @memberof PostSendSmsTestFailed
   */
  code: number;
  /**
   * Response message
   * @type {string}
   * @memberof PostSendSmsTestFailed
   */
  message: string;
  /**
   *
   * @type {Array<string>}
   * @memberof PostSendSmsTestFailed
   */
  unexistingSms?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof PostSendSmsTestFailed
   */
  withoutListSms?: Array<string>;
}

/**
 * Check if a given object implements the PostSendSmsTestFailed interface.
 */
export function instanceOfPostSendSmsTestFailed(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'code' in value;
  isInstance = isInstance && 'message' in value;

  return isInstance;
}

export function PostSendSmsTestFailedFromJSON(json: any): PostSendSmsTestFailed {
  return PostSendSmsTestFailedFromJSONTyped(json, false);
}

export function PostSendSmsTestFailedFromJSONTyped(json: any, ignoreDiscriminator: boolean): PostSendSmsTestFailed {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    code: json['code'],
    message: json['message'],
    unexistingSms: !exists(json, 'unexistingSms') ? undefined : json['unexistingSms'],
    withoutListSms: !exists(json, 'withoutListSms') ? undefined : json['withoutListSms'],
  };
}

export function PostSendSmsTestFailedToJSON(value?: PostSendSmsTestFailed | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    code: value.code,
    message: value.message,
    unexistingSms: value.unexistingSms,
    withoutListSms: value.withoutListSms,
  };
}

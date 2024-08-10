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

import { exists, mapValues } from '../runtime.js';
/**
 * Sender details including id or email and name (optional). Only one of either Sender's email or Sender's ID shall be passed in one request at a time. For example `{"name":"xyz", "email":"example@abc.com"}` , `{"name":"xyz", "id":123}`
 * @export
 * @interface CreateSmtpTemplateSender
 */
export interface CreateSmtpTemplateSender {
  /**
   * Name of the sender. If not passed, will be set to default
   * @type {string}
   * @memberof CreateSmtpTemplateSender
   */
  name?: string;
  /**
   * Email of the sender
   * @type {string}
   * @memberof CreateSmtpTemplateSender
   */
  email?: string;
  /**
   * Select the sender for the template on the basis of sender id. In order to select a sender with specific pool of IP’s, dedicated ip users shall pass id (instead of email).
   * @type {number}
   * @memberof CreateSmtpTemplateSender
   */
  id?: number;
}

/**
 * Check if a given object implements the CreateSmtpTemplateSender interface.
 */
export function instanceOfCreateSmtpTemplateSender(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CreateSmtpTemplateSenderFromJSON(json: any): CreateSmtpTemplateSender {
  return CreateSmtpTemplateSenderFromJSONTyped(json, false);
}

export function CreateSmtpTemplateSenderFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateSmtpTemplateSender {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: !exists(json, 'name') ? undefined : json['name'],
    email: !exists(json, 'email') ? undefined : json['email'],
    id: !exists(json, 'id') ? undefined : json['id'],
  };
}

export function CreateSmtpTemplateSenderToJSON(value?: CreateSmtpTemplateSender | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    email: value.email,
    id: value.id,
  };
}

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
 * @interface CreateContact
 */
export interface CreateContact {
  /**
   * Email address of the user. Mandatory if "SMS" field is not passed in "attributes" parameter. Mobile Number in "SMS" field should be passed with proper country code. For example {"SMS":"+91xxxxxxxxxx"} or {"SMS":"0091xxxxxxxxxx"}
   * @type {string}
   * @memberof CreateContact
   */
  email?: string;
  /**
   * Pass the set of attributes and their values. These attributes must be present in your SendinBlue account. For eg. {"FNAME":"Elly", "LNAME":"Roger"}
   * @type {object}
   * @memberof CreateContact
   */
  attributes?: object;
  /**
   * Set this field to blacklist the contact for emails (emailBlacklisted = true)
   * @type {boolean}
   * @memberof CreateContact
   */
  emailBlacklisted?: boolean;
  /**
   * Set this field to blacklist the contact for SMS (smsBlacklisted = true)
   * @type {boolean}
   * @memberof CreateContact
   */
  smsBlacklisted?: boolean;
  /**
   * Ids of the lists to add the contact to
   * @type {Array<number>}
   * @memberof CreateContact
   */
  listIds?: Array<number>;
  /**
   * Facilitate to update the existing contact in the same request (updateEnabled = true)
   * @type {boolean}
   * @memberof CreateContact
   */
  updateEnabled?: boolean;
  /**
   * transactional email forbidden sender for contact. Use only for email Contact ( only available if updateEnabled = true )
   * @type {Array<string>}
   * @memberof CreateContact
   */
  smtpBlacklistSender?: Array<string>;
}

/**
 * Check if a given object implements the CreateContact interface.
 */
export function instanceOfCreateContact(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CreateContactFromJSON(json: any): CreateContact {
  return CreateContactFromJSONTyped(json, false);
}

export function CreateContactFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateContact {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    email: !exists(json, 'email') ? undefined : json['email'],
    attributes: !exists(json, 'attributes') ? undefined : json['attributes'],
    emailBlacklisted: !exists(json, 'emailBlacklisted') ? undefined : json['emailBlacklisted'],
    smsBlacklisted: !exists(json, 'smsBlacklisted') ? undefined : json['smsBlacklisted'],
    listIds: !exists(json, 'listIds') ? undefined : json['listIds'],
    updateEnabled: !exists(json, 'updateEnabled') ? undefined : json['updateEnabled'],
    smtpBlacklistSender: !exists(json, 'smtpBlacklistSender') ? undefined : json['smtpBlacklistSender'],
  };
}

export function CreateContactToJSON(value?: CreateContact | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    email: value.email,
    attributes: value.attributes,
    emailBlacklisted: value.emailBlacklisted,
    smsBlacklisted: value.smsBlacklisted,
    listIds: value.listIds,
    updateEnabled: value.updateEnabled,
    smtpBlacklistSender: value.smtpBlacklistSender,
  };
}

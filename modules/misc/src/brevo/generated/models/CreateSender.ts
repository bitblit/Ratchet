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
import type { CreateSenderIpsInner } from './CreateSenderIpsInner.js';
import { CreateSenderIpsInnerFromJSON, CreateSenderIpsInnerToJSON } from './CreateSenderIpsInner.js';

/**
 *
 * @export
 * @interface CreateSender
 */
export interface CreateSender {
  /**
   * From Name to use for the sender
   * @type {string}
   * @memberof CreateSender
   */
  name: string;
  /**
   * From email to use for the sender. A verification email will be sent to this address.
   * @type {string}
   * @memberof CreateSender
   */
  email: string;
  /**
   * Mandatory in case of dedicated IP, IPs to associate to the sender
   * @type {Array<CreateSenderIpsInner>}
   * @memberof CreateSender
   */
  ips?: Array<CreateSenderIpsInner>;
}

/**
 * Check if a given object implements the CreateSender interface.
 */
export function instanceOfCreateSender(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'name' in value;
  isInstance = isInstance && 'email' in value;

  return isInstance;
}

export function CreateSenderFromJSON(json: any): CreateSender {
  return CreateSenderFromJSONTyped(json, false);
}

export function CreateSenderFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateSender {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: json['name'],
    email: json['email'],
    ips: !exists(json, 'ips') ? undefined : (json['ips'] as Array<any>).map(CreateSenderIpsInnerFromJSON),
  };
}

export function CreateSenderToJSON(value?: CreateSender | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    email: value.email,
    ips: value.ips === undefined ? undefined : (value.ips as Array<any>).map(CreateSenderIpsInnerToJSON),
  };
}

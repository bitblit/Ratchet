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
 *
 * @export
 * @interface BlockDomain
 */
export interface BlockDomain {
  /**
   * name of the domain to be blocked
   * @type {string}
   * @memberof BlockDomain
   */
  domain: string;
}

/**
 * Check if a given object implements the BlockDomain interface.
 */
export function instanceOfBlockDomain(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'domain' in value;

  return isInstance;
}

export function BlockDomainFromJSON(json: any): BlockDomain {
  return BlockDomainFromJSONTyped(json, false);
}

export function BlockDomainFromJSONTyped(json: any, ignoreDiscriminator: boolean): BlockDomain {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    domain: json['domain'],
  };
}

export function BlockDomainToJSON(value?: BlockDomain | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    domain: value.domain,
  };
}

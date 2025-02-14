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
 * @interface CreateChild
 */
export interface CreateChild {
  /**
   * Email address to create the child account
   * @type {string}
   * @memberof CreateChild
   */
  email: string;
  /**
   * First name to use to create the child account
   * @type {string}
   * @memberof CreateChild
   */
  firstName: string;
  /**
   * Last name to use to create the child account
   * @type {string}
   * @memberof CreateChild
   */
  lastName: string;
  /**
   * Company name to use to create the child account
   * @type {string}
   * @memberof CreateChild
   */
  companyName: string;
  /**
   * Password for the child account to login
   * @type {string}
   * @memberof CreateChild
   */
  password: string;
  /**
   * Language of the child account
   * @type {string}
   * @memberof CreateChild
   */
  language?: CreateChildLanguageEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum CreateChildLanguageEnum {
  Fr = 'fr',
  Es = 'es',
  Pt = 'pt',
  It = 'it',
  De = 'de',
  En = 'en',
}

/**
 * Check if a given object implements the CreateChild interface.
 */
export function instanceOfCreateChild(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'email' in value;
  isInstance = isInstance && 'firstName' in value;
  isInstance = isInstance && 'lastName' in value;
  isInstance = isInstance && 'companyName' in value;
  isInstance = isInstance && 'password' in value;

  return isInstance;
}

export function CreateChildFromJSON(json: any): CreateChild {
  return CreateChildFromJSONTyped(json, false);
}

export function CreateChildFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateChild {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    email: json['email'],
    firstName: json['firstName'],
    lastName: json['lastName'],
    companyName: json['companyName'],
    password: json['password'],
    language: !exists(json, 'language') ? undefined : json['language'],
  };
}

export function CreateChildToJSON(value?: CreateChild | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
    companyName: value.companyName,
    password: value.password,
    language: value.language,
  };
}

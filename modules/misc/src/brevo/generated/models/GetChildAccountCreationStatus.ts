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

/**
 *
 * @export
 * @interface GetChildAccountCreationStatus
 */
export interface GetChildAccountCreationStatus {
  /**
   * Status of child account creation whether it is successfully created (exists) or not.
   * @type {boolean}
   * @memberof GetChildAccountCreationStatus
   */
  childAccountCreated: boolean;
}

/**
 * Check if a given object implements the GetChildAccountCreationStatus interface.
 */
export function instanceOfGetChildAccountCreationStatus(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'childAccountCreated' in value;

  return isInstance;
}

export function GetChildAccountCreationStatusFromJSON(json: any): GetChildAccountCreationStatus {
  return GetChildAccountCreationStatusFromJSONTyped(json, false);
}

export function GetChildAccountCreationStatusFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetChildAccountCreationStatus {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    childAccountCreated: json['childAccountCreated'],
  };
}

export function GetChildAccountCreationStatusToJSON(value?: GetChildAccountCreationStatus | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    childAccountCreated: value.childAccountCreated,
  };
}

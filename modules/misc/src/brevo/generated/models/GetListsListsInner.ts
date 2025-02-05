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
 * @interface GetListsListsInner
 */
export interface GetListsListsInner {
  /**
   * ID of the list
   * @type {number}
   * @memberof GetListsListsInner
   */
  id: number;
  /**
   * Name of the list
   * @type {string}
   * @memberof GetListsListsInner
   */
  name: string;
  /**
   * Number of blacklisted contacts in the list
   * @type {number}
   * @memberof GetListsListsInner
   */
  totalBlacklisted: number;
  /**
   * Number of contacts in the list
   * @type {number}
   * @memberof GetListsListsInner
   */
  totalSubscribers: number;
  /**
   * ID of the folder
   * @type {number}
   * @memberof GetListsListsInner
   */
  folderId: number;
}

/**
 * Check if a given object implements the GetListsListsInner interface.
 */
export function instanceOfGetListsListsInner(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'id' in value;
  isInstance = isInstance && 'name' in value;
  isInstance = isInstance && 'totalBlacklisted' in value;
  isInstance = isInstance && 'totalSubscribers' in value;
  isInstance = isInstance && 'folderId' in value;

  return isInstance;
}

export function GetListsListsInnerFromJSON(json: any): GetListsListsInner {
  return GetListsListsInnerFromJSONTyped(json, false);
}

export function GetListsListsInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetListsListsInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    name: json['name'],
    totalBlacklisted: json['totalBlacklisted'],
    totalSubscribers: json['totalSubscribers'],
    folderId: json['folderId'],
  };
}

export function GetListsListsInnerToJSON(value?: GetListsListsInner | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    totalBlacklisted: value.totalBlacklisted,
    totalSubscribers: value.totalSubscribers,
    folderId: value.folderId,
  };
}

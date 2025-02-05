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
 * Percentage of a particular event for both versions
 * @export
 * @interface AbTestVersionStats
 */
export interface AbTestVersionStats {
  /**
   * percentage of an event for version A
   * @type {string}
   * @memberof AbTestVersionStats
   */
  versionA: string;
  /**
   * percentage of an event for version B
   * @type {string}
   * @memberof AbTestVersionStats
   */
  versionB: string;
}

/**
 * Check if a given object implements the AbTestVersionStats interface.
 */
export function instanceOfAbTestVersionStats(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'versionA' in value;
  isInstance = isInstance && 'versionB' in value;

  return isInstance;
}

export function AbTestVersionStatsFromJSON(json: any): AbTestVersionStats {
  return AbTestVersionStatsFromJSONTyped(json, false);
}

export function AbTestVersionStatsFromJSONTyped(json: any, ignoreDiscriminator: boolean): AbTestVersionStats {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    versionA: json['Version A'],
    versionB: json['Version B'],
  };
}

export function AbTestVersionStatsToJSON(value?: AbTestVersionStats | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    'Version A': value.versionA,
    'Version B': value.versionB,
  };
}

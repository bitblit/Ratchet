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
 * @interface AbTestVersionClicksInner
 */
export interface AbTestVersionClicksInner {
  /**
   * URL of the link
   * @type {string}
   * @memberof AbTestVersionClicksInner
   */
  link: string;
  /**
   * Number of times a link is clicked
   * @type {number}
   * @memberof AbTestVersionClicksInner
   */
  clicksCount: number;
  /**
   * Percentage of clicks of link with respect to total clicks
   * @type {string}
   * @memberof AbTestVersionClicksInner
   */
  clickRate: string;
}

/**
 * Check if a given object implements the AbTestVersionClicksInner interface.
 */
export function instanceOfAbTestVersionClicksInner(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'link' in value;
  isInstance = isInstance && 'clicksCount' in value;
  isInstance = isInstance && 'clickRate' in value;

  return isInstance;
}

export function AbTestVersionClicksInnerFromJSON(json: any): AbTestVersionClicksInner {
  return AbTestVersionClicksInnerFromJSONTyped(json, false);
}

export function AbTestVersionClicksInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): AbTestVersionClicksInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    link: json['link'],
    clicksCount: json['clicksCount'],
    clickRate: json['clickRate'],
  };
}

export function AbTestVersionClicksInnerToJSON(value?: AbTestVersionClicksInner | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    link: value.link,
    clicksCount: value.clicksCount,
    clickRate: value.clickRate,
  };
}

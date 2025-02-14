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
 * @interface GetWebhook
 */
export interface GetWebhook {
  /**
   * URL of the webhook
   * @type {string}
   * @memberof GetWebhook
   */
  url: string;
  /**
   * ID of the webhook
   * @type {number}
   * @memberof GetWebhook
   */
  id: number;
  /**
   * Description of the webhook
   * @type {string}
   * @memberof GetWebhook
   */
  description: string;
  /**
   *
   * @type {Array<string>}
   * @memberof GetWebhook
   */
  events: Array<string>;
  /**
   * Type of webhook (marketing or transac)
   * @type {string}
   * @memberof GetWebhook
   */
  type: GetWebhookTypeEnum;
  /**
   * Creation UTC date-time of the webhook (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {Date}
   * @memberof GetWebhook
   */
  createdAt: Date;
  /**
   * Last modification UTC date-time of the webhook (YYYY-MM-DDTHH:mm:ss.SSSZ)
   * @type {Date}
   * @memberof GetWebhook
   */
  modifiedAt: Date;
}

/**
 * @export
 * @enum {string}
 */
export enum GetWebhookTypeEnum {
  Marketing = 'marketing',
  Transac = 'transac',
}

/**
 * Check if a given object implements the GetWebhook interface.
 */
export function instanceOfGetWebhook(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'url' in value;
  isInstance = isInstance && 'id' in value;
  isInstance = isInstance && 'description' in value;
  isInstance = isInstance && 'events' in value;
  isInstance = isInstance && 'type' in value;
  isInstance = isInstance && 'createdAt' in value;
  isInstance = isInstance && 'modifiedAt' in value;

  return isInstance;
}

export function GetWebhookFromJSON(json: any): GetWebhook {
  return GetWebhookFromJSONTyped(json, false);
}

export function GetWebhookFromJSONTyped(json: any, ignoreDiscriminator: boolean): GetWebhook {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    url: json['url'],
    id: json['id'],
    description: json['description'],
    events: json['events'],
    type: json['type'],
    createdAt: new Date(json['createdAt']),
    modifiedAt: new Date(json['modifiedAt']),
  };
}

export function GetWebhookToJSON(value?: GetWebhook | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    url: value.url,
    id: value.id,
    description: value.description,
    events: value.events,
    type: value.type,
    createdAt: value.createdAt.toISOString(),
    modifiedAt: value.modifiedAt.toISOString(),
  };
}

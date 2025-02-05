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
 * @interface WhatsappCampStats
 */
export interface WhatsappCampStats {
  /**
   *
   * @type {number}
   * @memberof WhatsappCampStats
   */
  sent: number;
  /**
   *
   * @type {number}
   * @memberof WhatsappCampStats
   */
  delivered: number;
  /**
   *
   * @type {number}
   * @memberof WhatsappCampStats
   */
  read: number;
  /**
   *
   * @type {number}
   * @memberof WhatsappCampStats
   */
  unsubscribe: number;
  /**
   *
   * @type {number}
   * @memberof WhatsappCampStats
   */
  notSent: number;
}

/**
 * Check if a given object implements the WhatsappCampStats interface.
 */
export function instanceOfWhatsappCampStats(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'sent' in value;
  isInstance = isInstance && 'delivered' in value;
  isInstance = isInstance && 'read' in value;
  isInstance = isInstance && 'unsubscribe' in value;
  isInstance = isInstance && 'notSent' in value;

  return isInstance;
}

export function WhatsappCampStatsFromJSON(json: any): WhatsappCampStats {
  return WhatsappCampStatsFromJSONTyped(json, false);
}

export function WhatsappCampStatsFromJSONTyped(json: any, ignoreDiscriminator: boolean): WhatsappCampStats {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    sent: json['sent'],
    delivered: json['delivered'],
    read: json['read'],
    unsubscribe: json['unsubscribe'],
    notSent: json['notSent'],
  };
}

export function WhatsappCampStatsToJSON(value?: WhatsappCampStats | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    sent: value.sent,
    delivered: value.delivered,
    read: value.read,
    unsubscribe: value.unsubscribe,
    notSent: value.notSent,
  };
}

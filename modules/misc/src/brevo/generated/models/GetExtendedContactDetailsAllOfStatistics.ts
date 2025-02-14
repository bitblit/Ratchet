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
import type { GetExtendedContactDetailsAllOfStatisticsClicked } from './GetExtendedContactDetailsAllOfStatisticsClicked.js';
import {
  GetExtendedContactDetailsAllOfStatisticsClickedFromJSON,
  GetExtendedContactDetailsAllOfStatisticsClickedToJSON,
} from './GetExtendedContactDetailsAllOfStatisticsClicked.js';
import type { GetExtendedContactDetailsAllOfStatisticsMessagesSent } from './GetExtendedContactDetailsAllOfStatisticsMessagesSent.js';
import {
  GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON,
  GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON,
} from './GetExtendedContactDetailsAllOfStatisticsMessagesSent.js';
import type { GetExtendedContactDetailsAllOfStatisticsOpened } from './GetExtendedContactDetailsAllOfStatisticsOpened.js';
import {
  GetExtendedContactDetailsAllOfStatisticsOpenedFromJSON,
  GetExtendedContactDetailsAllOfStatisticsOpenedToJSON,
} from './GetExtendedContactDetailsAllOfStatisticsOpened.js';
import type { GetExtendedContactDetailsAllOfStatisticsUnsubscriptions } from './GetExtendedContactDetailsAllOfStatisticsUnsubscriptions.js';
import {
  GetExtendedContactDetailsAllOfStatisticsUnsubscriptionsFromJSON,
  GetExtendedContactDetailsAllOfStatisticsUnsubscriptionsToJSON,
} from './GetExtendedContactDetailsAllOfStatisticsUnsubscriptions.js';

/**
 * Campaign statistics of the contact
 * @export
 * @interface GetExtendedContactDetailsAllOfStatistics
 */
export interface GetExtendedContactDetailsAllOfStatistics {
  /**
   * Listing of the sent campaign for the contact
   * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  messagesSent?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
  /**
   * Listing of the hardbounes generated by the contact
   * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  hardBounces?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
  /**
   * Listing of the softbounes generated by the contact
   * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  softBounces?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
  /**
   * Listing of the complaints generated by the contact
   * @type {Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  complaints?: Array<GetExtendedContactDetailsAllOfStatisticsMessagesSent>;
  /**
   *
   * @type {GetExtendedContactDetailsAllOfStatisticsUnsubscriptions}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  unsubscriptions?: GetExtendedContactDetailsAllOfStatisticsUnsubscriptions;
  /**
   * Listing of the openings generated by the contact
   * @type {Array<GetExtendedContactDetailsAllOfStatisticsOpened>}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  opened?: Array<GetExtendedContactDetailsAllOfStatisticsOpened>;
  /**
   * Listing of the clicks generated by the contact
   * @type {Array<GetExtendedContactDetailsAllOfStatisticsClicked>}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  clicked?: Array<GetExtendedContactDetailsAllOfStatisticsClicked>;
  /**
   * Listing of the transactional attributes for the contact
   * @type {Array<object>}
   * @memberof GetExtendedContactDetailsAllOfStatistics
   */
  transacAttributes?: Array<object>;
}

/**
 * Check if a given object implements the GetExtendedContactDetailsAllOfStatistics interface.
 */
export function instanceOfGetExtendedContactDetailsAllOfStatistics(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function GetExtendedContactDetailsAllOfStatisticsFromJSON(json: any): GetExtendedContactDetailsAllOfStatistics {
  return GetExtendedContactDetailsAllOfStatisticsFromJSONTyped(json, false);
}

export function GetExtendedContactDetailsAllOfStatisticsFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): GetExtendedContactDetailsAllOfStatistics {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    messagesSent: !exists(json, 'messagesSent')
      ? undefined
      : (json['messagesSent'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON),
    hardBounces: !exists(json, 'hardBounces')
      ? undefined
      : (json['hardBounces'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON),
    softBounces: !exists(json, 'softBounces')
      ? undefined
      : (json['softBounces'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON),
    complaints: !exists(json, 'complaints')
      ? undefined
      : (json['complaints'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentFromJSON),
    unsubscriptions: !exists(json, 'unsubscriptions')
      ? undefined
      : GetExtendedContactDetailsAllOfStatisticsUnsubscriptionsFromJSON(json['unsubscriptions']),
    opened: !exists(json, 'opened')
      ? undefined
      : (json['opened'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsOpenedFromJSON),
    clicked: !exists(json, 'clicked')
      ? undefined
      : (json['clicked'] as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsClickedFromJSON),
    transacAttributes: !exists(json, 'transacAttributes') ? undefined : json['transacAttributes'],
  };
}

export function GetExtendedContactDetailsAllOfStatisticsToJSON(value?: GetExtendedContactDetailsAllOfStatistics | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    messagesSent:
      value.messagesSent === undefined
        ? undefined
        : (value.messagesSent as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON),
    hardBounces:
      value.hardBounces === undefined
        ? undefined
        : (value.hardBounces as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON),
    softBounces:
      value.softBounces === undefined
        ? undefined
        : (value.softBounces as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON),
    complaints:
      value.complaints === undefined
        ? undefined
        : (value.complaints as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsMessagesSentToJSON),
    unsubscriptions: GetExtendedContactDetailsAllOfStatisticsUnsubscriptionsToJSON(value.unsubscriptions),
    opened: value.opened === undefined ? undefined : (value.opened as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsOpenedToJSON),
    clicked:
      value.clicked === undefined ? undefined : (value.clicked as Array<any>).map(GetExtendedContactDetailsAllOfStatisticsClickedToJSON),
    transacAttributes: value.transacAttributes,
  };
}

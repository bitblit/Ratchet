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

import type { AbTestVersionStats } from './AbTestVersionStats.js';
import { AbTestVersionStatsFromJSON, AbTestVersionStatsToJSON } from './AbTestVersionStats.js';

/**
 *
 * @export
 * @interface AbTestCampaignResultStatistics
 */
export interface AbTestCampaignResultStatistics {
  /**
   *
   * @type {AbTestVersionStats}
   * @memberof AbTestCampaignResultStatistics
   */
  openers: AbTestVersionStats;
  /**
   *
   * @type {AbTestVersionStats}
   * @memberof AbTestCampaignResultStatistics
   */
  clicks: AbTestVersionStats;
  /**
   *
   * @type {AbTestVersionStats}
   * @memberof AbTestCampaignResultStatistics
   */
  unsubscribed: AbTestVersionStats;
  /**
   *
   * @type {AbTestVersionStats}
   * @memberof AbTestCampaignResultStatistics
   */
  hardBounces: AbTestVersionStats;
  /**
   *
   * @type {AbTestVersionStats}
   * @memberof AbTestCampaignResultStatistics
   */
  softBounces: AbTestVersionStats;
  /**
   *
   * @type {AbTestVersionStats}
   * @memberof AbTestCampaignResultStatistics
   */
  complaints: AbTestVersionStats;
}

/**
 * Check if a given object implements the AbTestCampaignResultStatistics interface.
 */
export function instanceOfAbTestCampaignResultStatistics(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'openers' in value;
  isInstance = isInstance && 'clicks' in value;
  isInstance = isInstance && 'unsubscribed' in value;
  isInstance = isInstance && 'hardBounces' in value;
  isInstance = isInstance && 'softBounces' in value;
  isInstance = isInstance && 'complaints' in value;

  return isInstance;
}

export function AbTestCampaignResultStatisticsFromJSON(json: any): AbTestCampaignResultStatistics {
  return AbTestCampaignResultStatisticsFromJSONTyped(json, false);
}

export function AbTestCampaignResultStatisticsFromJSONTyped(json: any, ignoreDiscriminator: boolean): AbTestCampaignResultStatistics {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    openers: AbTestVersionStatsFromJSON(json['openers']),
    clicks: AbTestVersionStatsFromJSON(json['clicks']),
    unsubscribed: AbTestVersionStatsFromJSON(json['unsubscribed']),
    hardBounces: AbTestVersionStatsFromJSON(json['hardBounces']),
    softBounces: AbTestVersionStatsFromJSON(json['softBounces']),
    complaints: AbTestVersionStatsFromJSON(json['complaints']),
  };
}

export function AbTestCampaignResultStatisticsToJSON(value?: AbTestCampaignResultStatistics | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    openers: AbTestVersionStatsToJSON(value.openers),
    clicks: AbTestVersionStatsToJSON(value.clicks),
    unsubscribed: AbTestVersionStatsToJSON(value.unsubscribed),
    hardBounces: AbTestVersionStatsToJSON(value.hardBounces),
    softBounces: AbTestVersionStatsToJSON(value.softBounces),
    complaints: AbTestVersionStatsToJSON(value.complaints),
  };
}

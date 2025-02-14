/* eslint-disable */
/**
 * Sobol API Docs
 * An OpenAPI Implementation exposing Sobol\'s RESTful API
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: team@sobol.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists } from '../runtime.js';
import type { CustomFieldBadgeContentBadgesInner } from './CustomFieldBadgeContentBadgesInner.js';
import {
  CustomFieldBadgeContentBadgesInnerFromJSON,
  CustomFieldBadgeContentBadgesInnerToJSON,
} from './CustomFieldBadgeContentBadgesInner.js';

/**
 * Badge custom field content
 * @export
 * @interface CustomFieldBadgeContent
 */
export interface CustomFieldBadgeContent {
  /**
   *
   * @type {Array<CustomFieldBadgeContentBadgesInner>}
   * @memberof CustomFieldBadgeContent
   */
  badges?: Array<CustomFieldBadgeContentBadgesInner>;
}

/**
 * Check if a given object implements the CustomFieldBadgeContent interface.
 */
export function instanceOfCustomFieldBadgeContent(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CustomFieldBadgeContentFromJSON(json: any): CustomFieldBadgeContent {
  return CustomFieldBadgeContentFromJSONTyped(json, false);
}

export function CustomFieldBadgeContentFromJSONTyped(json: any, ignoreDiscriminator: boolean): CustomFieldBadgeContent {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    badges: !exists(json, 'badges') ? undefined : (json['badges'] as Array<any>).map(CustomFieldBadgeContentBadgesInnerFromJSON),
  };
}

export function CustomFieldBadgeContentToJSON(value?: CustomFieldBadgeContent | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    badges: value.badges === undefined ? undefined : (value.badges as Array<any>).map(CustomFieldBadgeContentBadgesInnerToJSON),
  };
}

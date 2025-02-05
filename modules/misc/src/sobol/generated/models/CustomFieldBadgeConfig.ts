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

import { exists, mapValues } from '../runtime.js';
import type { CustomFieldBadgeConfigOptionsValue } from './CustomFieldBadgeConfigOptionsValue.js';
import {
  CustomFieldBadgeConfigOptionsValueFromJSON,
  CustomFieldBadgeConfigOptionsValueToJSON,
} from './CustomFieldBadgeConfigOptionsValue.js';

/**
 * Single select dropdown custom field config
 * @export
 * @interface CustomFieldBadgeConfig
 */
export interface CustomFieldBadgeConfig {
  /**
   *
   * @type {{ [key: string]: CustomFieldBadgeConfigOptionsValue; }}
   * @memberof CustomFieldBadgeConfig
   */
  options?: { [key: string]: CustomFieldBadgeConfigOptionsValue };
}

/**
 * Check if a given object implements the CustomFieldBadgeConfig interface.
 */
export function instanceOfCustomFieldBadgeConfig(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CustomFieldBadgeConfigFromJSON(json: any): CustomFieldBadgeConfig {
  return CustomFieldBadgeConfigFromJSONTyped(json, false);
}

export function CustomFieldBadgeConfigFromJSONTyped(json: any, ignoreDiscriminator: boolean): CustomFieldBadgeConfig {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    options: !exists(json, 'options') ? undefined : mapValues(json['options'], CustomFieldBadgeConfigOptionsValueFromJSON),
  };
}

export function CustomFieldBadgeConfigToJSON(value?: CustomFieldBadgeConfig | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    options: value.options === undefined ? undefined : mapValues(value.options, CustomFieldBadgeConfigOptionsValueToJSON),
  };
}

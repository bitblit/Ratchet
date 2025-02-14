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
import type { CustomFieldSingleSelectDropDownConfigOptionsValue } from './CustomFieldSingleSelectDropDownConfigOptionsValue.js';
import {
  CustomFieldSingleSelectDropDownConfigOptionsValueFromJSON,
  CustomFieldSingleSelectDropDownConfigOptionsValueToJSON,
} from './CustomFieldSingleSelectDropDownConfigOptionsValue.js';

/**
 * Badge custom field config
 * @export
 * @interface CustomFieldMultiSelectDropDownConfig
 */
export interface CustomFieldMultiSelectDropDownConfig {
  /**
   *
   * @type {{ [key: string]: CustomFieldSingleSelectDropDownConfigOptionsValue; }}
   * @memberof CustomFieldMultiSelectDropDownConfig
   */
  options?: { [key: string]: CustomFieldSingleSelectDropDownConfigOptionsValue };
}

/**
 * Check if a given object implements the CustomFieldMultiSelectDropDownConfig interface.
 */
export function instanceOfCustomFieldMultiSelectDropDownConfig(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CustomFieldMultiSelectDropDownConfigFromJSON(json: any): CustomFieldMultiSelectDropDownConfig {
  return CustomFieldMultiSelectDropDownConfigFromJSONTyped(json, false);
}

export function CustomFieldMultiSelectDropDownConfigFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CustomFieldMultiSelectDropDownConfig {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    options: !exists(json, 'options') ? undefined : mapValues(json['options'], CustomFieldSingleSelectDropDownConfigOptionsValueFromJSON),
  };
}

export function CustomFieldMultiSelectDropDownConfigToJSON(value?: CustomFieldMultiSelectDropDownConfig | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    options: value.options === undefined ? undefined : mapValues(value.options, CustomFieldSingleSelectDropDownConfigOptionsValueToJSON),
  };
}

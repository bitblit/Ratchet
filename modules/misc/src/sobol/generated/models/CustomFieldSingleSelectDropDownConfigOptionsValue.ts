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

/**
 *
 * @export
 * @interface CustomFieldSingleSelectDropDownConfigOptionsValue
 */
export interface CustomFieldSingleSelectDropDownConfigOptionsValue {
  /**
   *
   * @type {string}
   * @memberof CustomFieldSingleSelectDropDownConfigOptionsValue
   */
  _id?: string;
  /**
   *
   * @type {string}
   * @memberof CustomFieldSingleSelectDropDownConfigOptionsValue
   */
  name?: string;
}

/**
 * Check if a given object implements the CustomFieldSingleSelectDropDownConfigOptionsValue interface.
 */
export function instanceOfCustomFieldSingleSelectDropDownConfigOptionsValue(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CustomFieldSingleSelectDropDownConfigOptionsValueFromJSON(json: any): CustomFieldSingleSelectDropDownConfigOptionsValue {
  return CustomFieldSingleSelectDropDownConfigOptionsValueFromJSONTyped(json, false);
}

export function CustomFieldSingleSelectDropDownConfigOptionsValueFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CustomFieldSingleSelectDropDownConfigOptionsValue {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: !exists(json, '_id') ? undefined : json['_id'],
    name: !exists(json, 'name') ? undefined : json['name'],
  };
}

export function CustomFieldSingleSelectDropDownConfigOptionsValueToJSON(
  value?: CustomFieldSingleSelectDropDownConfigOptionsValue | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    _id: value._id,
    name: value.name,
  };
}

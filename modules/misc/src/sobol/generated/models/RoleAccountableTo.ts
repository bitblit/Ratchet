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
/**
 *
 * @export
 * @interface RoleAccountableTo
 */
export interface RoleAccountableTo {
  /**
   *
   * @type {string}
   * @memberof RoleAccountableTo
   */
  _id?: string;
  /**
   *
   * @type {string}
   * @memberof RoleAccountableTo
   */
  _type?: RoleAccountableToTypeEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum RoleAccountableToTypeEnum {
  role = 'role',
}

/**
 * Check if a given object implements the RoleAccountableTo interface.
 */
export function instanceOfRoleAccountableTo(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function RoleAccountableToFromJSON(json: any): RoleAccountableTo {
  return RoleAccountableToFromJSONTyped(json, false);
}

export function RoleAccountableToFromJSONTyped(json: any, ignoreDiscriminator: boolean): RoleAccountableTo {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: !exists(json, '_id') ? undefined : json['_id'],
    _type: !exists(json, '_type') ? undefined : json['_type'],
  };
}

export function RoleAccountableToToJSON(value?: RoleAccountableTo | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    _id: value._id,
    _type: value._type,
  };
}

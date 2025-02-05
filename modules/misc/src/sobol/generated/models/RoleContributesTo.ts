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
 * @interface RoleContributesTo
 */
export interface RoleContributesTo {
  /**
   *
   * @type {string}
   * @memberof RoleContributesTo
   */
  _id?: string;
  /**
   *
   * @type {string}
   * @memberof RoleContributesTo
   */
  _type?: RoleContributesToTypeEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum RoleContributesToTypeEnum {
  team = 'team',
}

/**
 * Check if a given object implements the RoleContributesTo interface.
 */
export function instanceOfRoleContributesTo(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function RoleContributesToFromJSON(json: any): RoleContributesTo {
  return RoleContributesToFromJSONTyped(json, false);
}

export function RoleContributesToFromJSONTyped(json: any, ignoreDiscriminator: boolean): RoleContributesTo {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: !exists(json, '_id') ? undefined : json['_id'],
    _type: !exists(json, '_type') ? undefined : json['_type'],
  };
}

export function RoleContributesToToJSON(value?: RoleContributesTo | null): any {
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

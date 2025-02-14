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
 * @interface UserLocalIdentitiesInner
 */
export interface UserLocalIdentitiesInner {
  /**
   *
   * @type {string}
   * @memberof UserLocalIdentitiesInner
   */
  _id?: string;
  /**
   *
   * @type {string}
   * @memberof UserLocalIdentitiesInner
   */
  _type?: UserLocalIdentitiesInnerTypeEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum UserLocalIdentitiesInnerTypeEnum {
  local_identity = 'local_identity',
}

/**
 * Check if a given object implements the UserLocalIdentitiesInner interface.
 */
export function instanceOfUserLocalIdentitiesInner(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function UserLocalIdentitiesInnerFromJSON(json: any): UserLocalIdentitiesInner {
  return UserLocalIdentitiesInnerFromJSONTyped(json, false);
}

export function UserLocalIdentitiesInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserLocalIdentitiesInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: !exists(json, '_id') ? undefined : json['_id'],
    _type: !exists(json, '_type') ? undefined : json['_type'],
  };
}

export function UserLocalIdentitiesInnerToJSON(value?: UserLocalIdentitiesInner | null): any {
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

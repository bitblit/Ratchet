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
 * @interface AgreementOwnersInner
 */
export interface AgreementOwnersInner {
  /**
   *
   * @type {string}
   * @memberof AgreementOwnersInner
   */
  _id?: string;
  /**
   *
   * @type {string}
   * @memberof AgreementOwnersInner
   */
  _type?: AgreementOwnersInnerTypeEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum AgreementOwnersInnerTypeEnum {
  team = 'team',
  user = 'user',
  role = 'role',
}

/**
 * Check if a given object implements the AgreementOwnersInner interface.
 */
export function instanceOfAgreementOwnersInner(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function AgreementOwnersInnerFromJSON(json: any): AgreementOwnersInner {
  return AgreementOwnersInnerFromJSONTyped(json, false);
}

export function AgreementOwnersInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): AgreementOwnersInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: !exists(json, '_id') ? undefined : json['_id'],
    _type: !exists(json, '_type') ? undefined : json['_type'],
  };
}

export function AgreementOwnersInnerToJSON(value?: AgreementOwnersInner | null): any {
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

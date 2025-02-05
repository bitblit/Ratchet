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
import type { AddressTypeInternalEnum } from './AddressTypeInternalEnum.js';
import { AddressTypeInternalEnumFromJSON, AddressTypeInternalEnumToJSON } from './AddressTypeInternalEnum.js';

/**
 *
 * @export
 * @interface Address
 */
export interface Address {
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _id: string;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _type?: AddressTypeEnum;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _rootId: string;
  /**
   *
   * @type {Date}
   * @memberof Address
   */
  _createdOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _createdBy: string;
  /**
   *
   * @type {Date}
   * @memberof Address
   */
  _updatedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _updatedBy?: string;
  /**
   *
   * @type {Date}
   * @memberof Address
   */
  _archivedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _archivedBy?: string;
  /**
   *
   * @type {Date}
   * @memberof Address
   */
  _deletedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _deletedBy?: string;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  _operationId?: string;
  /**
   *
   * @type {boolean}
   * @memberof Address
   */
  _isPublic?: boolean;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  address: string;
  /**
   *
   * @type {string}
   * @memberof Address
   */
  chainId?: AddressChainIdEnum;
  /**
   *
   * @type {AddressTypeInternalEnum}
   * @memberof Address
   */
  type?: AddressTypeInternalEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum AddressTypeEnum {
  address = 'address',
}
/**
 * @export
 * @enum {string}
 */
export enum AddressChainIdEnum {
  _1 = '1',
  _137 = '137',
  _42161 = '42161',
  _100 = '100',
  _10 = '10',
  _1313161554 = '1313161554',
  _43114 = '43114',
  _56 = '56',
  _5 = '5',
  _11155111 = '11155111',
}

/**
 * Check if a given object implements the Address interface.
 */
export function instanceOfAddress(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && '_id' in value;
  isInstance = isInstance && '_rootId' in value;
  isInstance = isInstance && '_createdBy' in value;
  isInstance = isInstance && 'address' in value;

  return isInstance;
}

export function AddressFromJSON(json: any): Address {
  return AddressFromJSONTyped(json, false);
}

export function AddressFromJSONTyped(json: any, ignoreDiscriminator: boolean): Address {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: json['_id'],
    _type: !exists(json, '_type') ? undefined : json['_type'],
    _rootId: json['_rootId'],
    _createdOn: !exists(json, '_createdOn') ? undefined : new Date(json['_createdOn']),
    _createdBy: json['_createdBy'],
    _updatedOn: !exists(json, '_updatedOn') ? undefined : new Date(json['_updatedOn']),
    _updatedBy: !exists(json, '_updatedBy') ? undefined : json['_updatedBy'],
    _archivedOn: !exists(json, '_archivedOn') ? undefined : new Date(json['_archivedOn']),
    _archivedBy: !exists(json, '_archivedBy') ? undefined : json['_archivedBy'],
    _deletedOn: !exists(json, '_deletedOn') ? undefined : new Date(json['_deletedOn']),
    _deletedBy: !exists(json, '_deletedBy') ? undefined : json['_deletedBy'],
    _operationId: !exists(json, '_operationId') ? undefined : json['_operationId'],
    _isPublic: !exists(json, '_isPublic') ? undefined : json['_isPublic'],
    name: !exists(json, 'name') ? undefined : json['name'],
    address: json['address'],
    chainId: !exists(json, 'chainId') ? undefined : json['chainId'],
    type: !exists(json, 'type') ? undefined : AddressTypeInternalEnumFromJSON(json['type']),
  };
}

export function AddressToJSON(value?: Address | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    _id: value._id,
    _type: value._type,
    _rootId: value._rootId,
    _createdOn: value._createdOn === undefined ? undefined : value._createdOn.toISOString(),
    _createdBy: value._createdBy,
    _updatedOn: value._updatedOn === undefined ? undefined : value._updatedOn.toISOString(),
    _updatedBy: value._updatedBy,
    _archivedOn: value._archivedOn === undefined ? undefined : value._archivedOn.toISOString(),
    _archivedBy: value._archivedBy,
    _deletedOn: value._deletedOn === undefined ? undefined : value._deletedOn.toISOString(),
    _deletedBy: value._deletedBy,
    _operationId: value._operationId,
    _isPublic: value._isPublic,
    name: value.name,
    address: value.address,
    chainId: value.chainId,
    type: AddressTypeInternalEnumToJSON(value.type),
  };
}

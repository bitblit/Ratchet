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
import type { CustomFieldConfig } from './CustomFieldConfig.js';
import { CustomFieldConfigFromJSON, CustomFieldConfigToJSON } from './CustomFieldConfig.js';

/**
 *
 * @export
 * @interface CustomField
 */
export interface CustomField {
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _id?: string;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _type?: CustomFieldTypeEnum;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _rootId?: string;
  /**
   *
   * @type {Date}
   * @memberof CustomField
   */
  _createdOn?: Date;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _createdBy?: string;
  /**
   *
   * @type {Date}
   * @memberof CustomField
   */
  _updatedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _updatedBy?: string;
  /**
   *
   * @type {Date}
   * @memberof CustomField
   */
  _archivedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _archivedBy?: string;
  /**
   *
   * @type {Date}
   * @memberof CustomField
   */
  _deletedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _deletedBy?: string;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _operationId?: string;
  /**
   *
   * @type {boolean}
   * @memberof CustomField
   */
  _isPublic?: boolean;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  _fieldType?: CustomFieldFieldTypeEnum;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  description?: string;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  placeholder?: string;
  /**
   *
   * @type {boolean}
   * @memberof CustomField
   */
  visibility?: boolean;
  /**
   *
   * @type {string}
   * @memberof CustomField
   */
  controlledBy?: string;
  /**
   *
   * @type {number}
   * @memberof CustomField
   */
  order?: number;
  /**
   *
   * @type {Array<string>}
   * @memberof CustomField
   */
  objectTypes?: Array<CustomFieldObjectTypesEnum>;
  /**
   *
   * @type {CustomFieldConfig}
   * @memberof CustomField
   */
  config?: CustomFieldConfig;
}

/**
 * @export
 * @enum {string}
 */
export enum CustomFieldTypeEnum {
  custom_field = 'custom_field',
}
/**
 * @export
 * @enum {string}
 */
export enum CustomFieldFieldTypeEnum {
  text = 'text',
  badge = 'badge',
  dropdown_single = 'dropdown_single',
  dropdown_multi = 'dropdown_multi',
  tag = 'tag',
  relates_to_single = 'relates_to_single',
  relates_to_multi = 'relates_to_multi',
}
/**
 * @export
 * @enum {string}
 */
export enum CustomFieldObjectTypesEnum {
  team = 'team',
  user = 'user',
  goal = 'goal',
  role = 'role',
  role_assignment = 'role_assignment',
  agreement = 'agreement',
}

/**
 * Check if a given object implements the CustomField interface.
 */
export function instanceOfCustomField(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CustomFieldFromJSON(json: any): CustomField {
  return CustomFieldFromJSONTyped(json, false);
}

export function CustomFieldFromJSONTyped(json: any, ignoreDiscriminator: boolean): CustomField {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: !exists(json, '_id') ? undefined : json['_id'],
    _type: !exists(json, '_type') ? undefined : json['_type'],
    _rootId: !exists(json, '_rootId') ? undefined : json['_rootId'],
    _createdOn: !exists(json, '_createdOn') ? undefined : new Date(json['_createdOn']),
    _createdBy: !exists(json, '_createdBy') ? undefined : json['_createdBy'],
    _updatedOn: !exists(json, '_updatedOn') ? undefined : new Date(json['_updatedOn']),
    _updatedBy: !exists(json, '_updatedBy') ? undefined : json['_updatedBy'],
    _archivedOn: !exists(json, '_archivedOn') ? undefined : new Date(json['_archivedOn']),
    _archivedBy: !exists(json, '_archivedBy') ? undefined : json['_archivedBy'],
    _deletedOn: !exists(json, '_deletedOn') ? undefined : new Date(json['_deletedOn']),
    _deletedBy: !exists(json, '_deletedBy') ? undefined : json['_deletedBy'],
    _operationId: !exists(json, '_operationId') ? undefined : json['_operationId'],
    _isPublic: !exists(json, '_isPublic') ? undefined : json['_isPublic'],
    _fieldType: !exists(json, '_fieldType') ? undefined : json['_fieldType'],
    name: !exists(json, 'name') ? undefined : json['name'],
    description: !exists(json, 'description') ? undefined : json['description'],
    placeholder: !exists(json, 'placeholder') ? undefined : json['placeholder'],
    visibility: !exists(json, 'visibility') ? undefined : json['visibility'],
    controlledBy: !exists(json, 'controlledBy') ? undefined : json['controlledBy'],
    order: !exists(json, 'order') ? undefined : json['order'],
    objectTypes: !exists(json, 'objectTypes') ? undefined : json['objectTypes'],
    config: !exists(json, 'config') ? undefined : CustomFieldConfigFromJSON(json['config']),
  };
}

export function CustomFieldToJSON(value?: CustomField | null): any {
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
    _fieldType: value._fieldType,
    name: value.name,
    description: value.description,
    placeholder: value.placeholder,
    visibility: value.visibility,
    controlledBy: value.controlledBy,
    order: value.order,
    objectTypes: value.objectTypes,
    config: CustomFieldConfigToJSON(value.config),
  };
}

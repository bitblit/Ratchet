/* tslint:disable */
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
import type { CustomFieldValueContent } from './CustomFieldValueContent.js';
import {
    CustomFieldValueContentFromJSON,
    CustomFieldValueContentFromJSONTyped,
    CustomFieldValueContentToJSON,
} from './CustomFieldValueContent.js';

/**
 * 
 * @export
 * @interface CustomFieldValue
 */
export interface CustomFieldValue {
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _id?: string;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _type?: CustomFieldValueTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _rootId?: string;
    /**
     * 
     * @type {Date}
     * @memberof CustomFieldValue
     */
    _createdOn?: Date;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _createdBy?: string;
    /**
     * 
     * @type {Date}
     * @memberof CustomFieldValue
     */
    _updatedOn?: Date;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _updatedBy?: string;
    /**
     * 
     * @type {Date}
     * @memberof CustomFieldValue
     */
    _archivedOn?: Date;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _archivedBy?: string;
    /**
     * 
     * @type {Date}
     * @memberof CustomFieldValue
     */
    _deletedOn?: Date;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _deletedBy?: string;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _operationId?: string;
    /**
     * 
     * @type {boolean}
     * @memberof CustomFieldValue
     */
    _isPublic?: boolean;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _customFieldId?: string;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _customFieldType?: string;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _customFieldName?: string;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _objectType?: CustomFieldValueObjectTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _objectId?: string;
    /**
     * 
     * @type {string}
     * @memberof CustomFieldValue
     */
    _fieldType?: CustomFieldValueFieldTypeEnum;
    /**
     * 
     * @type {CustomFieldValueContent}
     * @memberof CustomFieldValue
     */
    content?: CustomFieldValueContent;
}

/**
* @export
* @enum {string}
*/
export enum CustomFieldValueTypeEnum {
    custom_field_value = 'custom_field_value'
}
/**
* @export
* @enum {string}
*/
export enum CustomFieldValueObjectTypeEnum {
    team = 'team',
    user = 'user',
    goal = 'goal',
    role = 'role',
    role_assignment = 'role_assignment',
    agreement = 'agreement'
}
/**
* @export
* @enum {string}
*/
export enum CustomFieldValueFieldTypeEnum {
    text = 'text',
    badge = 'badge',
    dropdown_single = 'dropdown_single',
    dropdown_multi = 'dropdown_multi',
    tag = 'tag',
    relates_to_single = 'relates_to_single',
    relates_to_multi = 'relates_to_multi'
}


/**
 * Check if a given object implements the CustomFieldValue interface.
 */
export function instanceOfCustomFieldValue(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function CustomFieldValueFromJSON(json: any): CustomFieldValue {
    return CustomFieldValueFromJSONTyped(json, false);
}

export function CustomFieldValueFromJSONTyped(json: any, ignoreDiscriminator: boolean): CustomFieldValue {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        '_id': !exists(json, '_id') ? undefined : json['_id'],
        '_type': !exists(json, '_type') ? undefined : json['_type'],
        '_rootId': !exists(json, '_rootId') ? undefined : json['_rootId'],
        '_createdOn': !exists(json, '_createdOn') ? undefined : (new Date(json['_createdOn'])),
        '_createdBy': !exists(json, '_createdBy') ? undefined : json['_createdBy'],
        '_updatedOn': !exists(json, '_updatedOn') ? undefined : (new Date(json['_updatedOn'])),
        '_updatedBy': !exists(json, '_updatedBy') ? undefined : json['_updatedBy'],
        '_archivedOn': !exists(json, '_archivedOn') ? undefined : (new Date(json['_archivedOn'])),
        '_archivedBy': !exists(json, '_archivedBy') ? undefined : json['_archivedBy'],
        '_deletedOn': !exists(json, '_deletedOn') ? undefined : (new Date(json['_deletedOn'])),
        '_deletedBy': !exists(json, '_deletedBy') ? undefined : json['_deletedBy'],
        '_operationId': !exists(json, '_operationId') ? undefined : json['_operationId'],
        '_isPublic': !exists(json, '_isPublic') ? undefined : json['_isPublic'],
        '_customFieldId': !exists(json, '_customFieldId') ? undefined : json['_customFieldId'],
        '_customFieldType': !exists(json, '_customFieldType') ? undefined : json['_customFieldType'],
        '_customFieldName': !exists(json, '_customFieldName') ? undefined : json['_customFieldName'],
        '_objectType': !exists(json, '_objectType') ? undefined : json['_objectType'],
        '_objectId': !exists(json, '_objectId') ? undefined : json['_objectId'],
        '_fieldType': !exists(json, '_fieldType') ? undefined : json['_fieldType'],
        'content': !exists(json, 'content') ? undefined : CustomFieldValueContentFromJSON(json['content']),
    };
}

export function CustomFieldValueToJSON(value?: CustomFieldValue | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        '_id': value._id,
        '_type': value._type,
        '_rootId': value._rootId,
        '_createdOn': value._createdOn === undefined ? undefined : (value._createdOn.toISOString()),
        '_createdBy': value._createdBy,
        '_updatedOn': value._updatedOn === undefined ? undefined : (value._updatedOn.toISOString()),
        '_updatedBy': value._updatedBy,
        '_archivedOn': value._archivedOn === undefined ? undefined : (value._archivedOn.toISOString()),
        '_archivedBy': value._archivedBy,
        '_deletedOn': value._deletedOn === undefined ? undefined : (value._deletedOn.toISOString()),
        '_deletedBy': value._deletedBy,
        '_operationId': value._operationId,
        '_isPublic': value._isPublic,
        '_customFieldId': value._customFieldId,
        '_customFieldType': value._customFieldType,
        '_customFieldName': value._customFieldName,
        '_objectType': value._objectType,
        '_objectId': value._objectId,
        '_fieldType': value._fieldType,
        'content': CustomFieldValueContentToJSON(value.content),
    };
}

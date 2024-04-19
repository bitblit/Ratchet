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
import type { CustomFieldMultiSelectDropDownContentSelectedOptions } from './CustomFieldMultiSelectDropDownContentSelectedOptions.js';
import {
    CustomFieldMultiSelectDropDownContentSelectedOptionsFromJSON,
    CustomFieldMultiSelectDropDownContentSelectedOptionsFromJSONTyped,
    CustomFieldMultiSelectDropDownContentSelectedOptionsToJSON,
} from './CustomFieldMultiSelectDropDownContentSelectedOptions.js';

/**
 * Single select dropdown custom field content
 * @export
 * @interface CustomFieldMultiSelectDropDownContent
 */
export interface CustomFieldMultiSelectDropDownContent {
    /**
     * 
     * @type {CustomFieldMultiSelectDropDownContentSelectedOptions}
     * @memberof CustomFieldMultiSelectDropDownContent
     */
    selectedOptions?: CustomFieldMultiSelectDropDownContentSelectedOptions;
}

/**
 * Check if a given object implements the CustomFieldMultiSelectDropDownContent interface.
 */
export function instanceOfCustomFieldMultiSelectDropDownContent(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function CustomFieldMultiSelectDropDownContentFromJSON(json: any): CustomFieldMultiSelectDropDownContent {
    return CustomFieldMultiSelectDropDownContentFromJSONTyped(json, false);
}

export function CustomFieldMultiSelectDropDownContentFromJSONTyped(json: any, ignoreDiscriminator: boolean): CustomFieldMultiSelectDropDownContent {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'selectedOptions': !exists(json, 'selectedOptions') ? undefined : CustomFieldMultiSelectDropDownContentSelectedOptionsFromJSON(json['selectedOptions']),
    };
}

export function CustomFieldMultiSelectDropDownContentToJSON(value?: CustomFieldMultiSelectDropDownContent | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'selectedOptions': CustomFieldMultiSelectDropDownContentSelectedOptionsToJSON(value.selectedOptions),
    };
}


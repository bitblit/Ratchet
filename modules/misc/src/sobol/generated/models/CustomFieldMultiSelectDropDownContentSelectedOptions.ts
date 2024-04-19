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
/**
 * 
 * @export
 * @interface CustomFieldMultiSelectDropDownContentSelectedOptions
 */
export interface CustomFieldMultiSelectDropDownContentSelectedOptions {
    /**
     * 
     * @type {Array<string>}
     * @memberof CustomFieldMultiSelectDropDownContentSelectedOptions
     */
    ids?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof CustomFieldMultiSelectDropDownContentSelectedOptions
     */
    values?: Array<string>;
}

/**
 * Check if a given object implements the CustomFieldMultiSelectDropDownContentSelectedOptions interface.
 */
export function instanceOfCustomFieldMultiSelectDropDownContentSelectedOptions(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function CustomFieldMultiSelectDropDownContentSelectedOptionsFromJSON(json: any): CustomFieldMultiSelectDropDownContentSelectedOptions {
    return CustomFieldMultiSelectDropDownContentSelectedOptionsFromJSONTyped(json, false);
}

export function CustomFieldMultiSelectDropDownContentSelectedOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): CustomFieldMultiSelectDropDownContentSelectedOptions {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'ids': !exists(json, 'ids') ? undefined : json['ids'],
        'values': !exists(json, 'values') ? undefined : json['values'],
    };
}

export function CustomFieldMultiSelectDropDownContentSelectedOptionsToJSON(value?: CustomFieldMultiSelectDropDownContentSelectedOptions | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'ids': value.ids,
        'values': value.values,
    };
}

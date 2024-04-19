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

import type { CustomFieldBadgeConfig } from './CustomFieldBadgeConfig.js';
import {
    instanceOfCustomFieldBadgeConfig,
    CustomFieldBadgeConfigFromJSON,
    CustomFieldBadgeConfigFromJSONTyped,
    CustomFieldBadgeConfigToJSON,
} from './CustomFieldBadgeConfig.js';
import type { CustomFieldMultiSelectDropDownConfig } from './CustomFieldMultiSelectDropDownConfig.js';
import {
    instanceOfCustomFieldMultiSelectDropDownConfig,
    CustomFieldMultiSelectDropDownConfigFromJSON,
    CustomFieldMultiSelectDropDownConfigFromJSONTyped,
    CustomFieldMultiSelectDropDownConfigToJSON,
} from './CustomFieldMultiSelectDropDownConfig.js';
import type { CustomFieldSingleSelectDropDownConfig } from './CustomFieldSingleSelectDropDownConfig.js';
import {
    instanceOfCustomFieldSingleSelectDropDownConfig,
    CustomFieldSingleSelectDropDownConfigFromJSON,
    CustomFieldSingleSelectDropDownConfigFromJSONTyped,
    CustomFieldSingleSelectDropDownConfigToJSON,
} from './CustomFieldSingleSelectDropDownConfig.js';
import type { CustomFieldTextConfig } from './CustomFieldTextConfig.js';
import {
    instanceOfCustomFieldTextConfig,
    CustomFieldTextConfigFromJSON,
    CustomFieldTextConfigFromJSONTyped,
    CustomFieldTextConfigToJSON,
} from './CustomFieldTextConfig.js';

/**
 * @type CustomFieldConfig
 * 
 * @export
 */
export type CustomFieldConfig = CustomFieldBadgeConfig | CustomFieldMultiSelectDropDownConfig | CustomFieldSingleSelectDropDownConfig | CustomFieldTextConfig;

export function CustomFieldConfigFromJSON(json: any): CustomFieldConfig {
    return CustomFieldConfigFromJSONTyped(json, false);
}

export function CustomFieldConfigFromJSONTyped(json: any, ignoreDiscriminator: boolean): CustomFieldConfig {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return { ...CustomFieldBadgeConfigFromJSONTyped(json, true), ...CustomFieldMultiSelectDropDownConfigFromJSONTyped(json, true), ...CustomFieldSingleSelectDropDownConfigFromJSONTyped(json, true), ...CustomFieldTextConfigFromJSONTyped(json, true) };
}

export function CustomFieldConfigToJSON(value?: CustomFieldConfig | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }

    if (instanceOfCustomFieldBadgeConfig(value)) {
        return CustomFieldBadgeConfigToJSON(value as CustomFieldBadgeConfig);
    }
    if (instanceOfCustomFieldMultiSelectDropDownConfig(value)) {
        return CustomFieldMultiSelectDropDownConfigToJSON(value as CustomFieldMultiSelectDropDownConfig);
    }
    if (instanceOfCustomFieldSingleSelectDropDownConfig(value)) {
        return CustomFieldSingleSelectDropDownConfigToJSON(value as CustomFieldSingleSelectDropDownConfig);
    }
    if (instanceOfCustomFieldTextConfig(value)) {
        return CustomFieldTextConfigToJSON(value as CustomFieldTextConfig);
    }

    return {};
}


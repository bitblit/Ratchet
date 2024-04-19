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
 * @interface GoalOwnersInner
 */
export interface GoalOwnersInner {
    /**
     * 
     * @type {string}
     * @memberof GoalOwnersInner
     */
    _id?: string;
    /**
     * 
     * @type {string}
     * @memberof GoalOwnersInner
     */
    _type?: GoalOwnersInnerTypeEnum;
}

/**
* @export
* @enum {string}
*/
export enum GoalOwnersInnerTypeEnum {
    role = 'role',
    team = 'team',
    user = 'user'
}


/**
 * Check if a given object implements the GoalOwnersInner interface.
 */
export function instanceOfGoalOwnersInner(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function GoalOwnersInnerFromJSON(json: any): GoalOwnersInner {
    return GoalOwnersInnerFromJSONTyped(json, false);
}

export function GoalOwnersInnerFromJSONTyped(json: any, ignoreDiscriminator: boolean): GoalOwnersInner {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        '_id': !exists(json, '_id') ? undefined : json['_id'],
        '_type': !exists(json, '_type') ? undefined : json['_type'],
    };
}

export function GoalOwnersInnerToJSON(value?: GoalOwnersInner | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        '_id': value._id,
        '_type': value._type,
    };
}


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
 * @interface GoalParentGoal
 */
export interface GoalParentGoal {
  /**
   *
   * @type {string}
   * @memberof GoalParentGoal
   */
  _id?: string;
  /**
   *
   * @type {string}
   * @memberof GoalParentGoal
   */
  _type?: GoalParentGoalTypeEnum;
}

/**
 * @export
 * @enum {string}
 */
export enum GoalParentGoalTypeEnum {
  goal = 'goal',
}

/**
 * Check if a given object implements the GoalParentGoal interface.
 */
export function instanceOfGoalParentGoal(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function GoalParentGoalFromJSON(json: any): GoalParentGoal {
  return GoalParentGoalFromJSONTyped(json, false);
}

export function GoalParentGoalFromJSONTyped(json: any, ignoreDiscriminator: boolean): GoalParentGoal {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    _id: !exists(json, '_id') ? undefined : json['_id'],
    _type: !exists(json, '_type') ? undefined : json['_type'],
  };
}

export function GoalParentGoalToJSON(value?: GoalParentGoal | null): any {
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

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
import type { RoleContributesTo } from './RoleContributesTo.js';
import { RoleContributesToFromJSON, RoleContributesToToJSON } from './RoleContributesTo.js';
import type { TeamOwnersInner } from './TeamOwnersInner.js';
import { TeamOwnersInnerFromJSON, TeamOwnersInnerToJSON } from './TeamOwnersInner.js';

/**
 *
 * @export
 * @interface Team
 */
export interface Team {
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _id: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _type?: TeamTypeEnum;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _rootId: string;
  /**
   *
   * @type {Date}
   * @memberof Team
   */
  _createdOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _createdBy: string;
  /**
   *
   * @type {Date}
   * @memberof Team
   */
  _updatedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _updatedBy?: string;
  /**
   *
   * @type {Date}
   * @memberof Team
   */
  _archivedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _archivedBy?: string;
  /**
   *
   * @type {Date}
   * @memberof Team
   */
  _deletedOn?: Date;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _deletedBy?: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _operationId?: string;
  /**
   *
   * @type {boolean}
   * @memberof Team
   */
  _isPublic?: boolean;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  name: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _picture?: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _picture_small?: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _picture_medium?: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  _picture_large?: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  description?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof Team
   */
  addresses: Array<string>;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  templateId?: string;
  /**
   *
   * @type {string}
   * @memberof Team
   */
  status?: TeamStatusEnum;
  /**
   *
   * @type {RoleContributesTo}
   * @memberof Team
   */
  parentTeam: RoleContributesTo;
  /**
   *
   * @type {Array<TeamOwnersInner>}
   * @memberof Team
   */
  owners?: Array<TeamOwnersInner>;
}

/**
 * @export
 * @enum {string}
 */
export enum TeamTypeEnum {
  team = 'team',
}
/**
 * @export
 * @enum {string}
 */
export enum TeamStatusEnum {
  draft = 'draft',
  active = 'active',
  archived = 'archived',
}

/**
 * Check if a given object implements the Team interface.
 */
export function instanceOfTeam(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && '_id' in value;
  isInstance = isInstance && '_rootId' in value;
  isInstance = isInstance && '_createdBy' in value;
  isInstance = isInstance && 'name' in value;
  isInstance = isInstance && 'addresses' in value;
  isInstance = isInstance && 'parentTeam' in value;

  return isInstance;
}

export function TeamFromJSON(json: any): Team {
  return TeamFromJSONTyped(json, false);
}

export function TeamFromJSONTyped(json: any, ignoreDiscriminator: boolean): Team {
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
    name: json['name'],
    _picture: !exists(json, '_picture') ? undefined : json['_picture'],
    _picture_small: !exists(json, '_picture_small') ? undefined : json['_picture_small'],
    _picture_medium: !exists(json, '_picture_medium') ? undefined : json['_picture_medium'],
    _picture_large: !exists(json, '_picture_large') ? undefined : json['_picture_large'],
    description: !exists(json, 'description') ? undefined : json['description'],
    addresses: json['addresses'],
    templateId: !exists(json, 'templateId') ? undefined : json['templateId'],
    status: !exists(json, 'status') ? undefined : json['status'],
    parentTeam: RoleContributesToFromJSON(json['parentTeam']),
    owners: !exists(json, 'owners') ? undefined : (json['owners'] as Array<any>).map(TeamOwnersInnerFromJSON),
  };
}

export function TeamToJSON(value?: Team | null): any {
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
    _picture: value._picture,
    _picture_small: value._picture_small,
    _picture_medium: value._picture_medium,
    _picture_large: value._picture_large,
    description: value.description,
    addresses: value.addresses,
    templateId: value.templateId,
    status: value.status,
    parentTeam: RoleContributesToToJSON(value.parentTeam),
    owners: value.owners === undefined ? undefined : (value.owners as Array<any>).map(TeamOwnersInnerToJSON),
  };
}

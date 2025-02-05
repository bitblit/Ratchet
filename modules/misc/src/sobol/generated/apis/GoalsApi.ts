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

import * as runtime from '../runtime.js';
import type { Goal, ObjectRef } from '../models/index.js';
import { GoalFromJSON, GoalToJSON, ObjectRefToJSON } from '../models/index.js';

export interface OrgOrgIdGoalsGetRequest {
  orgId: string;
}

export interface OrgOrgIdGoalsObjectIdDeleteRequest {
  orgId: string;
  objectId: string;
}

export interface OrgOrgIdGoalsObjectIdOwnersPostRequest {
  orgId: string;
  objectId: string;
  objectRef: Array<ObjectRef>;
}

export interface OrgOrgIdGoalsObjectIdParentPostRequest {
  orgId: string;
  objectId: string;
  objectRef: ObjectRef;
}

export interface OrgOrgIdGoalsObjectIdPutRequest {
  orgId: string;
  objectId: string;
  goal: Goal;
}

export interface OrgOrgIdGoalsPostRequest {
  orgId: string;
  goal: Goal;
}

/**
 * GoalsApi - interface
 *
 * @export
 * @interface GoalsApiInterface
 */
export interface GoalsApiInterface {
  /**
   *
   * @summary Get all goals in the organization
   * @param {string} orgId ID of the organization
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GoalsApiInterface
   */
  orgOrgIdGoalsGetRaw(
    requestParameters: OrgOrgIdGoalsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Goal>>>;

  /**
   * Get all goals in the organization
   */
  orgOrgIdGoalsGet(
    requestParameters: OrgOrgIdGoalsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Goal>>;

  /**
   *
   * @summary Delete a goal
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GoalsApiInterface
   */
  orgOrgIdGoalsObjectIdDeleteRaw(
    requestParameters: OrgOrgIdGoalsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Delete a goal
   */
  orgOrgIdGoalsObjectIdDelete(
    requestParameters: OrgOrgIdGoalsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Update a goal\'s owners
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {Array<ObjectRef>} objectRef Array of object refs of owners
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GoalsApiInterface
   */
  orgOrgIdGoalsObjectIdOwnersPostRaw(
    requestParameters: OrgOrgIdGoalsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Update a goal\'s owners
   */
  orgOrgIdGoalsObjectIdOwnersPost(
    requestParameters: OrgOrgIdGoalsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Update a goal\'s parent goal
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {ObjectRef} objectRef Reference to a goal object to add as the parent.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GoalsApiInterface
   */
  orgOrgIdGoalsObjectIdParentPostRaw(
    requestParameters: OrgOrgIdGoalsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Update a goal\'s parent goal
   */
  orgOrgIdGoalsObjectIdParentPost(
    requestParameters: OrgOrgIdGoalsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Update a goal
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {Goal} goal
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GoalsApiInterface
   */
  orgOrgIdGoalsObjectIdPutRaw(
    requestParameters: OrgOrgIdGoalsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Goal>>;

  /**
   * Update a goal
   */
  orgOrgIdGoalsObjectIdPut(
    requestParameters: OrgOrgIdGoalsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Goal>;

  /**
   *
   * @summary Create a goal
   * @param {string} orgId ID of the organization
   * @param {Goal} goal
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GoalsApiInterface
   */
  orgOrgIdGoalsPostRaw(
    requestParameters: OrgOrgIdGoalsPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Goal>>;

  /**
   * Create a goal
   */
  orgOrgIdGoalsPost(requestParameters: OrgOrgIdGoalsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Goal>;
}

/**
 *
 */
export class GoalsApi extends runtime.BaseAPI implements GoalsApiInterface {
  /**
   * Get all goals in the organization
   */
  async orgOrgIdGoalsGetRaw(
    requestParameters: OrgOrgIdGoalsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Goal>>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdGoalsGet.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('APIKey', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request(
      {
        path: `/org/{orgId}/goals`.replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId))),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(GoalFromJSON));
  }

  /**
   * Get all goals in the organization
   */
  async orgOrgIdGoalsGet(
    requestParameters: OrgOrgIdGoalsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Goal>> {
    const response = await this.orgOrgIdGoalsGetRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Delete a goal
   */
  async orgOrgIdGoalsObjectIdDeleteRaw(
    requestParameters: OrgOrgIdGoalsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdGoalsObjectIdDelete.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdGoalsObjectIdDelete.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('APIKey', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request(
      {
        path: `/org/{orgId}/goals/{objectId}`
          .replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId)))
          .replace(`{${'objectId'}}`, encodeURIComponent(String(requestParameters.objectId))),
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a goal
   */
  async orgOrgIdGoalsObjectIdDelete(
    requestParameters: OrgOrgIdGoalsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.orgOrgIdGoalsObjectIdDeleteRaw(requestParameters, initOverrides);
  }

  /**
   * Update a goal\'s owners
   */
  async orgOrgIdGoalsObjectIdOwnersPostRaw(
    requestParameters: OrgOrgIdGoalsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdGoalsObjectIdOwnersPost.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdGoalsObjectIdOwnersPost.',
      );
    }

    if (requestParameters.objectRef === null || requestParameters.objectRef === undefined) {
      throw new runtime.RequiredError(
        'objectRef',
        'Required parameter requestParameters.objectRef was null or undefined when calling orgOrgIdGoalsObjectIdOwnersPost.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('APIKey', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request(
      {
        path: `/org/{orgId}/goals/{objectId}/owners`
          .replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId)))
          .replace(`{${'objectId'}}`, encodeURIComponent(String(requestParameters.objectId))),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: requestParameters.objectRef.map(ObjectRefToJSON),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update a goal\'s owners
   */
  async orgOrgIdGoalsObjectIdOwnersPost(
    requestParameters: OrgOrgIdGoalsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.orgOrgIdGoalsObjectIdOwnersPostRaw(requestParameters, initOverrides);
  }

  /**
   * Update a goal\'s parent goal
   */
  async orgOrgIdGoalsObjectIdParentPostRaw(
    requestParameters: OrgOrgIdGoalsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdGoalsObjectIdParentPost.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdGoalsObjectIdParentPost.',
      );
    }

    if (requestParameters.objectRef === null || requestParameters.objectRef === undefined) {
      throw new runtime.RequiredError(
        'objectRef',
        'Required parameter requestParameters.objectRef was null or undefined when calling orgOrgIdGoalsObjectIdParentPost.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('APIKey', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request(
      {
        path: `/org/{orgId}/goals/{objectId}/parent`
          .replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId)))
          .replace(`{${'objectId'}}`, encodeURIComponent(String(requestParameters.objectId))),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ObjectRefToJSON(requestParameters.objectRef),
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update a goal\'s parent goal
   */
  async orgOrgIdGoalsObjectIdParentPost(
    requestParameters: OrgOrgIdGoalsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.orgOrgIdGoalsObjectIdParentPostRaw(requestParameters, initOverrides);
  }

  /**
   * Update a goal
   */
  async orgOrgIdGoalsObjectIdPutRaw(
    requestParameters: OrgOrgIdGoalsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Goal>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdGoalsObjectIdPut.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdGoalsObjectIdPut.',
      );
    }

    if (requestParameters.goal === null || requestParameters.goal === undefined) {
      throw new runtime.RequiredError(
        'goal',
        'Required parameter requestParameters.goal was null or undefined when calling orgOrgIdGoalsObjectIdPut.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('APIKey', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request(
      {
        path: `/org/{orgId}/goals/{objectId}`
          .replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId)))
          .replace(`{${'objectId'}}`, encodeURIComponent(String(requestParameters.objectId))),
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: GoalToJSON(requestParameters.goal),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GoalFromJSON(jsonValue));
  }

  /**
   * Update a goal
   */
  async orgOrgIdGoalsObjectIdPut(
    requestParameters: OrgOrgIdGoalsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Goal> {
    const response = await this.orgOrgIdGoalsObjectIdPutRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Create a goal
   */
  async orgOrgIdGoalsPostRaw(
    requestParameters: OrgOrgIdGoalsPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Goal>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdGoalsPost.',
      );
    }

    if (requestParameters.goal === null || requestParameters.goal === undefined) {
      throw new runtime.RequiredError(
        'goal',
        'Required parameter requestParameters.goal was null or undefined when calling orgOrgIdGoalsPost.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('APIKey', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request(
      {
        path: `/org/{orgId}/goals`.replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId))),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: GoalToJSON(requestParameters.goal),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GoalFromJSON(jsonValue));
  }

  /**
   * Create a goal
   */
  async orgOrgIdGoalsPost(
    requestParameters: OrgOrgIdGoalsPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Goal> {
    const response = await this.orgOrgIdGoalsPostRaw(requestParameters, initOverrides);
    return await response.value();
  }
}

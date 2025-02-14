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
import type { ObjectRef, Team } from '../models/index.js';
import { ObjectRefToJSON, TeamFromJSON, TeamToJSON } from '../models/index.js';

export interface OrgOrgIdTeamsGetRequest {
  orgId: string;
}

export interface OrgOrgIdTeamsObjectIdDeleteRequest {
  orgId: string;
  objectId: string;
}

export interface OrgOrgIdTeamsObjectIdGetRequest {
  orgId: string;
  objectId: string;
}

export interface OrgOrgIdTeamsObjectIdMembersPostRequest {
  orgId: string;
  objectId: string;
  objectRef: Array<ObjectRef>;
}

export interface OrgOrgIdTeamsObjectIdOwnersPostRequest {
  orgId: string;
  objectId: string;
  objectRef: Array<ObjectRef>;
}

export interface OrgOrgIdTeamsObjectIdParentPostRequest {
  orgId: string;
  objectId: string;
  objectRef: ObjectRef;
}

export interface OrgOrgIdTeamsObjectIdPutRequest {
  orgId: string;
  objectId: string;
  team: Team;
}

export interface OrgOrgIdTeamsPostRequest {
  orgId: string;
  team: Team;
}

/**
 * TeamsApi - interface
 *
 * @export
 * @interface TeamsApiInterface
 */
export interface TeamsApiInterface {
  /**
   *
   * @summary Get all teams
   * @param {string} orgId ID of the organization
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsGetRaw(
    requestParameters: OrgOrgIdTeamsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Team>>>;

  /**
   * Get all teams
   */
  orgOrgIdTeamsGet(
    requestParameters: OrgOrgIdTeamsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Team>>;

  /**
   *
   * @summary Delete a team
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsObjectIdDeleteRaw(
    requestParameters: OrgOrgIdTeamsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Delete a team
   */
  orgOrgIdTeamsObjectIdDelete(
    requestParameters: OrgOrgIdTeamsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Get a team
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsObjectIdGetRaw(
    requestParameters: OrgOrgIdTeamsObjectIdGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Team>>>;

  /**
   * Get a team
   */
  orgOrgIdTeamsObjectIdGet(
    requestParameters: OrgOrgIdTeamsObjectIdGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Team>>;

  /**
   *
   * @summary Update the team\'s members
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {Array<ObjectRef>} objectRef Array of object refs of members
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsObjectIdMembersPostRaw(
    requestParameters: OrgOrgIdTeamsObjectIdMembersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Update the team\'s members
   */
  orgOrgIdTeamsObjectIdMembersPost(
    requestParameters: OrgOrgIdTeamsObjectIdMembersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Update the team\'s owners
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {Array<ObjectRef>} objectRef Array of object refs of owners
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsObjectIdOwnersPostRaw(
    requestParameters: OrgOrgIdTeamsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Update the team\'s owners
   */
  orgOrgIdTeamsObjectIdOwnersPost(
    requestParameters: OrgOrgIdTeamsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Move the team under a different parent team
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {ObjectRef} objectRef Team Parent Object
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsObjectIdParentPostRaw(
    requestParameters: OrgOrgIdTeamsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Move the team under a different parent team
   */
  orgOrgIdTeamsObjectIdParentPost(
    requestParameters: OrgOrgIdTeamsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Update a team
   * @param {string} orgId ID of the organization
   * @param {string} objectId ID of the object
   * @param {Team} team
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsObjectIdPutRaw(
    requestParameters: OrgOrgIdTeamsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Team>>;

  /**
   * Update a team
   */
  orgOrgIdTeamsObjectIdPut(
    requestParameters: OrgOrgIdTeamsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Team>;

  /**
   *
   * @summary Create a team
   * @param {string} orgId ID of the organization
   * @param {Team} team Team request object
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TeamsApiInterface
   */
  orgOrgIdTeamsPostRaw(
    requestParameters: OrgOrgIdTeamsPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Team>>;

  /**
   * Create a team
   */
  orgOrgIdTeamsPost(requestParameters: OrgOrgIdTeamsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Team>;
}

/**
 *
 */
export class TeamsApi extends runtime.BaseAPI implements TeamsApiInterface {
  /**
   * Get all teams
   */
  async orgOrgIdTeamsGetRaw(
    requestParameters: OrgOrgIdTeamsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Team>>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsGet.',
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
        path: `/org/{orgId}/teams`.replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId))),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(TeamFromJSON));
  }

  /**
   * Get all teams
   */
  async orgOrgIdTeamsGet(
    requestParameters: OrgOrgIdTeamsGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Team>> {
    const response = await this.orgOrgIdTeamsGetRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Delete a team
   */
  async orgOrgIdTeamsObjectIdDeleteRaw(
    requestParameters: OrgOrgIdTeamsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsObjectIdDelete.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdTeamsObjectIdDelete.',
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
        path: `/org/{orgId}/teams/{objectId}`
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
   * Delete a team
   */
  async orgOrgIdTeamsObjectIdDelete(
    requestParameters: OrgOrgIdTeamsObjectIdDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.orgOrgIdTeamsObjectIdDeleteRaw(requestParameters, initOverrides);
  }

  /**
   * Get a team
   */
  async orgOrgIdTeamsObjectIdGetRaw(
    requestParameters: OrgOrgIdTeamsObjectIdGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Team>>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsObjectIdGet.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdTeamsObjectIdGet.',
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
        path: `/org/{orgId}/teams/{objectId}`
          .replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId)))
          .replace(`{${'objectId'}}`, encodeURIComponent(String(requestParameters.objectId))),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(TeamFromJSON));
  }

  /**
   * Get a team
   */
  async orgOrgIdTeamsObjectIdGet(
    requestParameters: OrgOrgIdTeamsObjectIdGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Team>> {
    const response = await this.orgOrgIdTeamsObjectIdGetRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Update the team\'s members
   */
  async orgOrgIdTeamsObjectIdMembersPostRaw(
    requestParameters: OrgOrgIdTeamsObjectIdMembersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsObjectIdMembersPost.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdTeamsObjectIdMembersPost.',
      );
    }

    if (requestParameters.objectRef === null || requestParameters.objectRef === undefined) {
      throw new runtime.RequiredError(
        'objectRef',
        'Required parameter requestParameters.objectRef was null or undefined when calling orgOrgIdTeamsObjectIdMembersPost.',
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
        path: `/org/{orgId}/teams/{objectId}/members`
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
   * Update the team\'s members
   */
  async orgOrgIdTeamsObjectIdMembersPost(
    requestParameters: OrgOrgIdTeamsObjectIdMembersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.orgOrgIdTeamsObjectIdMembersPostRaw(requestParameters, initOverrides);
  }

  /**
   * Update the team\'s owners
   */
  async orgOrgIdTeamsObjectIdOwnersPostRaw(
    requestParameters: OrgOrgIdTeamsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsObjectIdOwnersPost.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdTeamsObjectIdOwnersPost.',
      );
    }

    if (requestParameters.objectRef === null || requestParameters.objectRef === undefined) {
      throw new runtime.RequiredError(
        'objectRef',
        'Required parameter requestParameters.objectRef was null or undefined when calling orgOrgIdTeamsObjectIdOwnersPost.',
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
        path: `/org/{orgId}/teams/{objectId}/owners`
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
   * Update the team\'s owners
   */
  async orgOrgIdTeamsObjectIdOwnersPost(
    requestParameters: OrgOrgIdTeamsObjectIdOwnersPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.orgOrgIdTeamsObjectIdOwnersPostRaw(requestParameters, initOverrides);
  }

  /**
   * Move the team under a different parent team
   */
  async orgOrgIdTeamsObjectIdParentPostRaw(
    requestParameters: OrgOrgIdTeamsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsObjectIdParentPost.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdTeamsObjectIdParentPost.',
      );
    }

    if (requestParameters.objectRef === null || requestParameters.objectRef === undefined) {
      throw new runtime.RequiredError(
        'objectRef',
        'Required parameter requestParameters.objectRef was null or undefined when calling orgOrgIdTeamsObjectIdParentPost.',
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
        path: `/org/{orgId}/teams/{objectId}/parent`
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
   * Move the team under a different parent team
   */
  async orgOrgIdTeamsObjectIdParentPost(
    requestParameters: OrgOrgIdTeamsObjectIdParentPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.orgOrgIdTeamsObjectIdParentPostRaw(requestParameters, initOverrides);
  }

  /**
   * Update a team
   */
  async orgOrgIdTeamsObjectIdPutRaw(
    requestParameters: OrgOrgIdTeamsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Team>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsObjectIdPut.',
      );
    }

    if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
      throw new runtime.RequiredError(
        'objectId',
        'Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdTeamsObjectIdPut.',
      );
    }

    if (requestParameters.team === null || requestParameters.team === undefined) {
      throw new runtime.RequiredError(
        'team',
        'Required parameter requestParameters.team was null or undefined when calling orgOrgIdTeamsObjectIdPut.',
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
        path: `/org/{orgId}/teams/{objectId}`
          .replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId)))
          .replace(`{${'objectId'}}`, encodeURIComponent(String(requestParameters.objectId))),
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: TeamToJSON(requestParameters.team),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => TeamFromJSON(jsonValue));
  }

  /**
   * Update a team
   */
  async orgOrgIdTeamsObjectIdPut(
    requestParameters: OrgOrgIdTeamsObjectIdPutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Team> {
    const response = await this.orgOrgIdTeamsObjectIdPutRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Create a team
   */
  async orgOrgIdTeamsPostRaw(
    requestParameters: OrgOrgIdTeamsPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Team>> {
    if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
      throw new runtime.RequiredError(
        'orgId',
        'Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdTeamsPost.',
      );
    }

    if (requestParameters.team === null || requestParameters.team === undefined) {
      throw new runtime.RequiredError(
        'team',
        'Required parameter requestParameters.team was null or undefined when calling orgOrgIdTeamsPost.',
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
        path: `/org/{orgId}/teams`.replace(`{${'orgId'}}`, encodeURIComponent(String(requestParameters.orgId))),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: TeamToJSON(requestParameters.team),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => TeamFromJSON(jsonValue));
  }

  /**
   * Create a team
   */
  async orgOrgIdTeamsPost(
    requestParameters: OrgOrgIdTeamsPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Team> {
    const response = await this.orgOrgIdTeamsPostRaw(requestParameters, initOverrides);
    return await response.value();
  }
}

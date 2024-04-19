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


import * as runtime from '../runtime.js';
import type {
  Agreement,
  ObjectRef,
} from '../models/index.js';
import {
    AgreementFromJSON,
    AgreementToJSON,
    ObjectRefFromJSON,
    ObjectRefToJSON,
} from '../models/index.js';

export interface OrgOrgIdAgreementsGetRequest {
    orgId: string;
}

export interface OrgOrgIdAgreementsObjectIdDeleteRequest {
    orgId: string;
    objectId: string;
}

export interface OrgOrgIdAgreementsObjectIdOwnersPostRequest {
    orgId: string;
    objectId: string;
    objectRef: Array<ObjectRef>;
}

export interface OrgOrgIdAgreementsObjectIdPutRequest {
    orgId: string;
    objectId: string;
    agreement?: Agreement;
}

export interface OrgOrgIdAgreementsObjectIdSignatoriesPostRequest {
    orgId: string;
    objectId: string;
    objectRef: ObjectRef;
}

export interface OrgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRequest {
    orgId: string;
    objectId: string;
    userId: string;
}

export interface OrgOrgIdAgreementsPostRequest {
    orgId: string;
    agreement: Agreement;
}

/**
 * AgreementsApi - interface
 * 
 * @export
 * @interface AgreementsApiInterface
 */
export interface AgreementsApiInterface {
    /**
     * 
     * @summary Get all agreements in the organization
     * @param {string} orgId ID of the organization
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AgreementsApiInterface
     */
    orgOrgIdAgreementsGetRaw(requestParameters: OrgOrgIdAgreementsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Agreement>>>;

    /**
     * Get all agreements in the organization
     */
    orgOrgIdAgreementsGet(requestParameters: OrgOrgIdAgreementsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Agreement>>;

    /**
     * 
     * @summary Delete an agreement
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AgreementsApiInterface
     */
    orgOrgIdAgreementsObjectIdDeleteRaw(requestParameters: OrgOrgIdAgreementsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Delete an agreement
     */
    orgOrgIdAgreementsObjectIdDelete(requestParameters: OrgOrgIdAgreementsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Update the agreement\'s owners. Note that this overwrites the entire list of owners.
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {Array<ObjectRef>} objectRef Array of object refs of owners
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AgreementsApiInterface
     */
    orgOrgIdAgreementsObjectIdOwnersPostRaw(requestParameters: OrgOrgIdAgreementsObjectIdOwnersPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Update the agreement\'s owners. Note that this overwrites the entire list of owners.
     */
    orgOrgIdAgreementsObjectIdOwnersPost(requestParameters: OrgOrgIdAgreementsObjectIdOwnersPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Update an agreement. Note that you cannot update `owners` or `signatories` directly here. There are specialized endpoints for modifying either collection.
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {Agreement} [agreement] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AgreementsApiInterface
     */
    orgOrgIdAgreementsObjectIdPutRaw(requestParameters: OrgOrgIdAgreementsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Agreement>>;

    /**
     * Update an agreement. Note that you cannot update `owners` or `signatories` directly here. There are specialized endpoints for modifying either collection.
     */
    orgOrgIdAgreementsObjectIdPut(requestParameters: OrgOrgIdAgreementsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Agreement>;

    /**
     * 
     * @summary Add a signatory to an agreement
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {ObjectRef} objectRef Reference to a user to add as a signatory. Note that Agreement must be Active to add signatories.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AgreementsApiInterface
     */
    orgOrgIdAgreementsObjectIdSignatoriesPostRaw(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Add a signatory to an agreement
     */
    orgOrgIdAgreementsObjectIdSignatoriesPost(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Remove a signatory from an agreement
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {string} userId ID of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AgreementsApiInterface
     */
    orgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRaw(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Remove a signatory from an agreement
     */
    orgOrgIdAgreementsObjectIdSignatoriesUserIdDelete(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Create an agreement
     * @param {string} orgId ID of the organization
     * @param {Agreement} agreement Agreement request object
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AgreementsApiInterface
     */
    orgOrgIdAgreementsPostRaw(requestParameters: OrgOrgIdAgreementsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Agreement>>;

    /**
     * Create an agreement
     */
    orgOrgIdAgreementsPost(requestParameters: OrgOrgIdAgreementsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Agreement>;

}

/**
 * 
 */
export class AgreementsApi extends runtime.BaseAPI implements AgreementsApiInterface {

    /**
     * Get all agreements in the organization
     */
    async orgOrgIdAgreementsGetRaw(requestParameters: OrgOrgIdAgreementsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Agreement>>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdAgreementsGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("APIKey", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/org/{orgId}/agreements`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(AgreementFromJSON));
    }

    /**
     * Get all agreements in the organization
     */
    async orgOrgIdAgreementsGet(requestParameters: OrgOrgIdAgreementsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Agreement>> {
        const response = await this.orgOrgIdAgreementsGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete an agreement
     */
    async orgOrgIdAgreementsObjectIdDeleteRaw(requestParameters: OrgOrgIdAgreementsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdAgreementsObjectIdDelete.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdAgreementsObjectIdDelete.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("APIKey", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/org/{orgId}/agreements/{objectId}`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete an agreement
     */
    async orgOrgIdAgreementsObjectIdDelete(requestParameters: OrgOrgIdAgreementsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.orgOrgIdAgreementsObjectIdDeleteRaw(requestParameters, initOverrides);
    }

    /**
     * Update the agreement\'s owners. Note that this overwrites the entire list of owners.
     */
    async orgOrgIdAgreementsObjectIdOwnersPostRaw(requestParameters: OrgOrgIdAgreementsObjectIdOwnersPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdAgreementsObjectIdOwnersPost.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdAgreementsObjectIdOwnersPost.');
        }

        if (requestParameters.objectRef === null || requestParameters.objectRef === undefined) {
            throw new runtime.RequiredError('objectRef','Required parameter requestParameters.objectRef was null or undefined when calling orgOrgIdAgreementsObjectIdOwnersPost.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("APIKey", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/org/{orgId}/agreements/{objectId}/owners`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters.objectRef.map(ObjectRefToJSON),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Update the agreement\'s owners. Note that this overwrites the entire list of owners.
     */
    async orgOrgIdAgreementsObjectIdOwnersPost(requestParameters: OrgOrgIdAgreementsObjectIdOwnersPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.orgOrgIdAgreementsObjectIdOwnersPostRaw(requestParameters, initOverrides);
    }

    /**
     * Update an agreement. Note that you cannot update `owners` or `signatories` directly here. There are specialized endpoints for modifying either collection.
     */
    async orgOrgIdAgreementsObjectIdPutRaw(requestParameters: OrgOrgIdAgreementsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Agreement>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdAgreementsObjectIdPut.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdAgreementsObjectIdPut.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("APIKey", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/org/{orgId}/agreements/{objectId}`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: AgreementToJSON(requestParameters.agreement),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AgreementFromJSON(jsonValue));
    }

    /**
     * Update an agreement. Note that you cannot update `owners` or `signatories` directly here. There are specialized endpoints for modifying either collection.
     */
    async orgOrgIdAgreementsObjectIdPut(requestParameters: OrgOrgIdAgreementsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Agreement> {
        const response = await this.orgOrgIdAgreementsObjectIdPutRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Add a signatory to an agreement
     */
    async orgOrgIdAgreementsObjectIdSignatoriesPostRaw(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdAgreementsObjectIdSignatoriesPost.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdAgreementsObjectIdSignatoriesPost.');
        }

        if (requestParameters.objectRef === null || requestParameters.objectRef === undefined) {
            throw new runtime.RequiredError('objectRef','Required parameter requestParameters.objectRef was null or undefined when calling orgOrgIdAgreementsObjectIdSignatoriesPost.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("APIKey", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/org/{orgId}/agreements/{objectId}/signatories`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ObjectRefToJSON(requestParameters.objectRef),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Add a signatory to an agreement
     */
    async orgOrgIdAgreementsObjectIdSignatoriesPost(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.orgOrgIdAgreementsObjectIdSignatoriesPostRaw(requestParameters, initOverrides);
    }

    /**
     * Remove a signatory from an agreement
     */
    async orgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRaw(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdAgreementsObjectIdSignatoriesUserIdDelete.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdAgreementsObjectIdSignatoriesUserIdDelete.');
        }

        if (requestParameters.userId === null || requestParameters.userId === undefined) {
            throw new runtime.RequiredError('userId','Required parameter requestParameters.userId was null or undefined when calling orgOrgIdAgreementsObjectIdSignatoriesUserIdDelete.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("APIKey", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/org/{orgId}/agreements/{objectId}/signatories/{userId}`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))).replace(`{${"userId"}}`, encodeURIComponent(String(requestParameters.userId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Remove a signatory from an agreement
     */
    async orgOrgIdAgreementsObjectIdSignatoriesUserIdDelete(requestParameters: OrgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.orgOrgIdAgreementsObjectIdSignatoriesUserIdDeleteRaw(requestParameters, initOverrides);
    }

    /**
     * Create an agreement
     */
    async orgOrgIdAgreementsPostRaw(requestParameters: OrgOrgIdAgreementsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Agreement>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdAgreementsPost.');
        }

        if (requestParameters.agreement === null || requestParameters.agreement === undefined) {
            throw new runtime.RequiredError('agreement','Required parameter requestParameters.agreement was null or undefined when calling orgOrgIdAgreementsPost.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("APIKey", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/org/{orgId}/agreements`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: AgreementToJSON(requestParameters.agreement),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => AgreementFromJSON(jsonValue));
    }

    /**
     * Create an agreement
     */
    async orgOrgIdAgreementsPost(requestParameters: OrgOrgIdAgreementsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Agreement> {
        const response = await this.orgOrgIdAgreementsPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
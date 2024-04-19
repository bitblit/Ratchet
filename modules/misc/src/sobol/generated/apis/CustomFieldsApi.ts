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
  CustomField,
} from '../models/index.js';
import {
    CustomFieldFromJSON,
    CustomFieldToJSON,
} from '../models/index.js';

export interface OrgOrgIdCustomFieldsGetRequest {
    orgId: string;
}

export interface OrgOrgIdCustomFieldsObjectIdDeleteRequest {
    orgId: string;
    objectId: string;
}

export interface OrgOrgIdCustomFieldsObjectIdGetRequest {
    orgId: string;
    objectId: string;
}

export interface OrgOrgIdCustomFieldsObjectIdPutRequest {
    orgId: string;
    objectId: string;
    customField: CustomField;
}

export interface OrgOrgIdCustomFieldsPostRequest {
    orgId: string;
    customField: CustomField;
}

/**
 * CustomFieldsApi - interface
 * 
 * @export
 * @interface CustomFieldsApiInterface
 */
export interface CustomFieldsApiInterface {
    /**
     * 
     * @summary Get all custom fields
     * @param {string} orgId ID of the organization
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomFieldsApiInterface
     */
    orgOrgIdCustomFieldsGetRaw(requestParameters: OrgOrgIdCustomFieldsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<CustomField>>>;

    /**
     * Get all custom fields
     */
    orgOrgIdCustomFieldsGet(requestParameters: OrgOrgIdCustomFieldsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<CustomField>>;

    /**
     * 
     * @summary Delete a custom field and all corresponding custom field values
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomFieldsApiInterface
     */
    orgOrgIdCustomFieldsObjectIdDeleteRaw(requestParameters: OrgOrgIdCustomFieldsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Delete a custom field and all corresponding custom field values
     */
    orgOrgIdCustomFieldsObjectIdDelete(requestParameters: OrgOrgIdCustomFieldsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Get a custom field
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomFieldsApiInterface
     */
    orgOrgIdCustomFieldsObjectIdGetRaw(requestParameters: OrgOrgIdCustomFieldsObjectIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CustomField>>;

    /**
     * Get a custom field
     */
    orgOrgIdCustomFieldsObjectIdGet(requestParameters: OrgOrgIdCustomFieldsObjectIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CustomField>;

    /**
     * 
     * @summary Update a custom field
     * @param {string} orgId ID of the organization
     * @param {string} objectId ID of the object
     * @param {CustomField} customField 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomFieldsApiInterface
     */
    orgOrgIdCustomFieldsObjectIdPutRaw(requestParameters: OrgOrgIdCustomFieldsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CustomField>>;

    /**
     * Update a custom field
     */
    orgOrgIdCustomFieldsObjectIdPut(requestParameters: OrgOrgIdCustomFieldsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CustomField>;

    /**
     * 
     * @summary Create a custom field
     * @param {string} orgId ID of the organization
     * @param {CustomField} customField 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CustomFieldsApiInterface
     */
    orgOrgIdCustomFieldsPostRaw(requestParameters: OrgOrgIdCustomFieldsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CustomField>>;

    /**
     * Create a custom field
     */
    orgOrgIdCustomFieldsPost(requestParameters: OrgOrgIdCustomFieldsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CustomField>;

}

/**
 * 
 */
export class CustomFieldsApi extends runtime.BaseAPI implements CustomFieldsApiInterface {

    /**
     * Get all custom fields
     */
    async orgOrgIdCustomFieldsGetRaw(requestParameters: OrgOrgIdCustomFieldsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<CustomField>>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdCustomFieldsGet.');
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
            path: `/org/{orgId}/custom-fields`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(CustomFieldFromJSON));
    }

    /**
     * Get all custom fields
     */
    async orgOrgIdCustomFieldsGet(requestParameters: OrgOrgIdCustomFieldsGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<CustomField>> {
        const response = await this.orgOrgIdCustomFieldsGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a custom field and all corresponding custom field values
     */
    async orgOrgIdCustomFieldsObjectIdDeleteRaw(requestParameters: OrgOrgIdCustomFieldsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdCustomFieldsObjectIdDelete.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdCustomFieldsObjectIdDelete.');
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
            path: `/org/{orgId}/custom-fields/{objectId}`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a custom field and all corresponding custom field values
     */
    async orgOrgIdCustomFieldsObjectIdDelete(requestParameters: OrgOrgIdCustomFieldsObjectIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.orgOrgIdCustomFieldsObjectIdDeleteRaw(requestParameters, initOverrides);
    }

    /**
     * Get a custom field
     */
    async orgOrgIdCustomFieldsObjectIdGetRaw(requestParameters: OrgOrgIdCustomFieldsObjectIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CustomField>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdCustomFieldsObjectIdGet.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdCustomFieldsObjectIdGet.');
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
            path: `/org/{orgId}/custom-fields/{objectId}`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CustomFieldFromJSON(jsonValue));
    }

    /**
     * Get a custom field
     */
    async orgOrgIdCustomFieldsObjectIdGet(requestParameters: OrgOrgIdCustomFieldsObjectIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CustomField> {
        const response = await this.orgOrgIdCustomFieldsObjectIdGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update a custom field
     */
    async orgOrgIdCustomFieldsObjectIdPutRaw(requestParameters: OrgOrgIdCustomFieldsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CustomField>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdCustomFieldsObjectIdPut.');
        }

        if (requestParameters.objectId === null || requestParameters.objectId === undefined) {
            throw new runtime.RequiredError('objectId','Required parameter requestParameters.objectId was null or undefined when calling orgOrgIdCustomFieldsObjectIdPut.');
        }

        if (requestParameters.customField === null || requestParameters.customField === undefined) {
            throw new runtime.RequiredError('customField','Required parameter requestParameters.customField was null or undefined when calling orgOrgIdCustomFieldsObjectIdPut.');
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
            path: `/org/{orgId}/custom-fields/{objectId}`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))).replace(`{${"objectId"}}`, encodeURIComponent(String(requestParameters.objectId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: CustomFieldToJSON(requestParameters.customField),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CustomFieldFromJSON(jsonValue));
    }

    /**
     * Update a custom field
     */
    async orgOrgIdCustomFieldsObjectIdPut(requestParameters: OrgOrgIdCustomFieldsObjectIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CustomField> {
        const response = await this.orgOrgIdCustomFieldsObjectIdPutRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Create a custom field
     */
    async orgOrgIdCustomFieldsPostRaw(requestParameters: OrgOrgIdCustomFieldsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CustomField>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling orgOrgIdCustomFieldsPost.');
        }

        if (requestParameters.customField === null || requestParameters.customField === undefined) {
            throw new runtime.RequiredError('customField','Required parameter requestParameters.customField was null or undefined when calling orgOrgIdCustomFieldsPost.');
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
            path: `/org/{orgId}/custom-fields`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CustomFieldToJSON(requestParameters.customField),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CustomFieldFromJSON(jsonValue));
    }

    /**
     * Create a custom field
     */
    async orgOrgIdCustomFieldsPost(requestParameters: OrgOrgIdCustomFieldsPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CustomField> {
        const response = await this.orgOrgIdCustomFieldsPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
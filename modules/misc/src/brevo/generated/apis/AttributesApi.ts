/* tslint:disable */
/* eslint-disable */
/**
 * SendinBlue API
 * SendinBlue provide a RESTFul API that can be used with any languages. With this API, you will be able to :   - Manage your campaigns and get the statistics   - Manage your contacts   - Send transactional Emails and SMS   - and much more...  You can download our wrappers at https://github.com/orgs/sendinblue  **Possible responses**   | Code | Message |   | :-------------: | ------------- |   | 200  | OK. Successful Request  |   | 201  | OK. Successful Creation |   | 202  | OK. Request accepted |   | 204  | OK. Successful Update/Deletion  |   | 400  | Error. Bad Request  |   | 401  | Error. Authentication Needed  |   | 402  | Error. Not enough credit, plan upgrade needed  |   | 403  | Error. Permission denied  |   | 404  | Error. Object does not exist |   | 405  | Error. Method not allowed  |   | 406  | Error. Not Acceptable  | 
 *
 * The version of the OpenAPI document: 3.0.0
 * Contact: contact@sendinblue.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime.js';
import type {
  CreateAttribute,
  ErrorModel,
  GetAttributes,
  UpdateAttribute,
} from '../models/index.js';
import {
    CreateAttributeFromJSON,
    CreateAttributeToJSON,
    ErrorModelFromJSON,
    ErrorModelToJSON,
    GetAttributesFromJSON,
    GetAttributesToJSON,
    UpdateAttributeFromJSON,
    UpdateAttributeToJSON,
} from '../models/index.js';

export interface CreateAttributeRequest {
    attributeCategory: CreateAttributeAttributeCategoryEnum;
    attributeName: string;
    createAttribute: CreateAttribute;
}

export interface DeleteAttributeRequest {
    attributeCategory: DeleteAttributeAttributeCategoryEnum;
    attributeName: string;
}

export interface UpdateAttributeRequest {
    attributeCategory: UpdateAttributeAttributeCategoryEnum;
    attributeName: string;
    updateAttribute: UpdateAttribute;
}

/**
 * AttributesApi - interface
 * 
 * @export
 * @interface AttributesApiInterface
 */
export interface AttributesApiInterface {
    /**
     * 
     * @summary Create contact attribute
     * @param {'normal' | 'transactional' | 'category' | 'calculated' | 'global'} attributeCategory Category of the attribute
     * @param {string} attributeName Name of the attribute
     * @param {CreateAttribute} createAttribute Values to create an attribute
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AttributesApiInterface
     */
    createAttributeRaw(requestParameters: CreateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Create contact attribute
     */
    createAttribute(requestParameters: CreateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Delete an attribute
     * @param {'normal' | 'transactional' | 'category' | 'calculated' | 'global'} attributeCategory Category of the attribute
     * @param {string} attributeName Name of the existing attribute
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AttributesApiInterface
     */
    deleteAttributeRaw(requestParameters: DeleteAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Delete an attribute
     */
    deleteAttribute(requestParameters: DeleteAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary List all attributes
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AttributesApiInterface
     */
    getAttributesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetAttributes>>;

    /**
     * List all attributes
     */
    getAttributes(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetAttributes>;

    /**
     * 
     * @summary Update contact attribute
     * @param {'category' | 'calculated' | 'global'} attributeCategory Category of the attribute
     * @param {string} attributeName Name of the existing attribute
     * @param {UpdateAttribute} updateAttribute Values to update an attribute
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AttributesApiInterface
     */
    updateAttributeRaw(requestParameters: UpdateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Update contact attribute
     */
    updateAttribute(requestParameters: UpdateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

}

/**
 * 
 */
export class AttributesApi extends runtime.BaseAPI implements AttributesApiInterface {

    /**
     * Create contact attribute
     */
    async createAttributeRaw(requestParameters: CreateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.attributeCategory === null || requestParameters.attributeCategory === undefined) {
            throw new runtime.RequiredError('attributeCategory','Required parameter requestParameters.attributeCategory was null or undefined when calling createAttribute.');
        }

        if (requestParameters.attributeName === null || requestParameters.attributeName === undefined) {
            throw new runtime.RequiredError('attributeName','Required parameter requestParameters.attributeName was null or undefined when calling createAttribute.');
        }

        if (requestParameters.createAttribute === null || requestParameters.createAttribute === undefined) {
            throw new runtime.RequiredError('createAttribute','Required parameter requestParameters.createAttribute was null or undefined when calling createAttribute.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/attributes/{attributeCategory}/{attributeName}`.replace(`{${"attributeCategory"}}`, encodeURIComponent(String(requestParameters.attributeCategory))).replace(`{${"attributeName"}}`, encodeURIComponent(String(requestParameters.attributeName))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateAttributeToJSON(requestParameters.createAttribute),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Create contact attribute
     */
    async createAttribute(requestParameters: CreateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.createAttributeRaw(requestParameters, initOverrides);
    }

    /**
     * Delete an attribute
     */
    async deleteAttributeRaw(requestParameters: DeleteAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.attributeCategory === null || requestParameters.attributeCategory === undefined) {
            throw new runtime.RequiredError('attributeCategory','Required parameter requestParameters.attributeCategory was null or undefined when calling deleteAttribute.');
        }

        if (requestParameters.attributeName === null || requestParameters.attributeName === undefined) {
            throw new runtime.RequiredError('attributeName','Required parameter requestParameters.attributeName was null or undefined when calling deleteAttribute.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/attributes/{attributeCategory}/{attributeName}`.replace(`{${"attributeCategory"}}`, encodeURIComponent(String(requestParameters.attributeCategory))).replace(`{${"attributeName"}}`, encodeURIComponent(String(requestParameters.attributeName))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete an attribute
     */
    async deleteAttribute(requestParameters: DeleteAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteAttributeRaw(requestParameters, initOverrides);
    }

    /**
     * List all attributes
     */
    async getAttributesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetAttributes>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/attributes`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetAttributesFromJSON(jsonValue));
    }

    /**
     * List all attributes
     */
    async getAttributes(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetAttributes> {
        const response = await this.getAttributesRaw(initOverrides);
        return await response.value();
    }

    /**
     * Update contact attribute
     */
    async updateAttributeRaw(requestParameters: UpdateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.attributeCategory === null || requestParameters.attributeCategory === undefined) {
            throw new runtime.RequiredError('attributeCategory','Required parameter requestParameters.attributeCategory was null or undefined when calling updateAttribute.');
        }

        if (requestParameters.attributeName === null || requestParameters.attributeName === undefined) {
            throw new runtime.RequiredError('attributeName','Required parameter requestParameters.attributeName was null or undefined when calling updateAttribute.');
        }

        if (requestParameters.updateAttribute === null || requestParameters.updateAttribute === undefined) {
            throw new runtime.RequiredError('updateAttribute','Required parameter requestParameters.updateAttribute was null or undefined when calling updateAttribute.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/attributes/{attributeCategory}/{attributeName}`.replace(`{${"attributeCategory"}}`, encodeURIComponent(String(requestParameters.attributeCategory))).replace(`{${"attributeName"}}`, encodeURIComponent(String(requestParameters.attributeName))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateAttributeToJSON(requestParameters.updateAttribute),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Update contact attribute
     */
    async updateAttribute(requestParameters: UpdateAttributeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.updateAttributeRaw(requestParameters, initOverrides);
    }

}

/**
  * @export
  * @enum {string}
  */
export enum CreateAttributeAttributeCategoryEnum {
    Normal = 'normal',
    Transactional = 'transactional',
    Category = 'category',
    Calculated = 'calculated',
    Global = 'global'
}
/**
  * @export
  * @enum {string}
  */
export enum DeleteAttributeAttributeCategoryEnum {
    Normal = 'normal',
    Transactional = 'transactional',
    Category = 'category',
    Calculated = 'calculated',
    Global = 'global'
}
/**
  * @export
  * @enum {string}
  */
export enum UpdateAttributeAttributeCategoryEnum {
    Category = 'category',
    Calculated = 'calculated',
    Global = 'global'
}
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
  CreateModel,
  CreateUpdateFolder,
  ErrorModel,
  GetFolder,
  GetFolderLists,
  GetFolders,
} from '../models/index.js';
import {
    CreateModelFromJSON,
    CreateModelToJSON,
    CreateUpdateFolderFromJSON,
    CreateUpdateFolderToJSON,
    ErrorModelFromJSON,
    ErrorModelToJSON,
    GetFolderFromJSON,
    GetFolderToJSON,
    GetFolderListsFromJSON,
    GetFolderListsToJSON,
    GetFoldersFromJSON,
    GetFoldersToJSON,
} from '../models/index.js';

export interface CreateFolderRequest {
    createFolder: CreateUpdateFolder;
}

export interface DeleteFolderRequest {
    folderId: number;
}

export interface GetFolderRequest {
    folderId: number;
}

export interface GetFolderListsRequest {
    folderId: number;
    limit?: number;
    offset?: number;
    sort?: GetFolderListsSortEnum;
}

export interface GetFoldersRequest {
    limit: number;
    offset: number;
    sort?: GetFoldersSortEnum;
}

export interface UpdateFolderRequest {
    folderId: number;
    updateFolder: CreateUpdateFolder;
}

/**
 * FoldersApi - interface
 * 
 * @export
 * @interface FoldersApiInterface
 */
export interface FoldersApiInterface {
    /**
     * 
     * @summary Create a folder
     * @param {CreateUpdateFolder} createFolder Name of the folder
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FoldersApiInterface
     */
    createFolderRaw(requestParameters: CreateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CreateModel>>;

    /**
     * Create a folder
     */
    createFolder(requestParameters: CreateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreateModel>;

    /**
     * 
     * @summary Delete a folder (and all its lists)
     * @param {number} folderId Id of the folder
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FoldersApiInterface
     */
    deleteFolderRaw(requestParameters: DeleteFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Delete a folder (and all its lists)
     */
    deleteFolder(requestParameters: DeleteFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

    /**
     * 
     * @summary Returns a folder\'s details
     * @param {number} folderId id of the folder
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FoldersApiInterface
     */
    getFolderRaw(requestParameters: GetFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetFolder>>;

    /**
     * Returns a folder\'s details
     */
    getFolder(requestParameters: GetFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetFolder>;

    /**
     * 
     * @summary Get lists in a folder
     * @param {number} folderId Id of the folder
     * @param {number} [limit] Number of documents per page
     * @param {number} [offset] Index of the first document of the page
     * @param {'asc' | 'desc'} [sort] Sort the results in the ascending/descending order of record creation
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FoldersApiInterface
     */
    getFolderListsRaw(requestParameters: GetFolderListsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetFolderLists>>;

    /**
     * Get lists in a folder
     */
    getFolderLists(requestParameters: GetFolderListsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetFolderLists>;

    /**
     * 
     * @summary Get all folders
     * @param {number} limit Number of documents per page
     * @param {number} offset Index of the first document of the page
     * @param {'asc' | 'desc'} [sort] Sort the results in the ascending/descending order of record creation
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FoldersApiInterface
     */
    getFoldersRaw(requestParameters: GetFoldersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetFolders>>;

    /**
     * Get all folders
     */
    getFolders(requestParameters: GetFoldersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetFolders>;

    /**
     * 
     * @summary Update a folder
     * @param {number} folderId Id of the folder
     * @param {CreateUpdateFolder} updateFolder Name of the folder
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FoldersApiInterface
     */
    updateFolderRaw(requestParameters: UpdateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;

    /**
     * Update a folder
     */
    updateFolder(requestParameters: UpdateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;

}

/**
 * 
 */
export class FoldersApi extends runtime.BaseAPI implements FoldersApiInterface {

    /**
     * Create a folder
     */
    async createFolderRaw(requestParameters: CreateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CreateModel>> {
        if (requestParameters.createFolder === null || requestParameters.createFolder === undefined) {
            throw new runtime.RequiredError('createFolder','Required parameter requestParameters.createFolder was null or undefined when calling createFolder.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/folders`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateUpdateFolderToJSON(requestParameters.createFolder),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CreateModelFromJSON(jsonValue));
    }

    /**
     * Create a folder
     */
    async createFolder(requestParameters: CreateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CreateModel> {
        const response = await this.createFolderRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a folder (and all its lists)
     */
    async deleteFolderRaw(requestParameters: DeleteFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.folderId === null || requestParameters.folderId === undefined) {
            throw new runtime.RequiredError('folderId','Required parameter requestParameters.folderId was null or undefined when calling deleteFolder.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/folders/{folderId}`.replace(`{${"folderId"}}`, encodeURIComponent(String(requestParameters.folderId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a folder (and all its lists)
     */
    async deleteFolder(requestParameters: DeleteFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteFolderRaw(requestParameters, initOverrides);
    }

    /**
     * Returns a folder\'s details
     */
    async getFolderRaw(requestParameters: GetFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetFolder>> {
        if (requestParameters.folderId === null || requestParameters.folderId === undefined) {
            throw new runtime.RequiredError('folderId','Required parameter requestParameters.folderId was null or undefined when calling getFolder.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/folders/{folderId}`.replace(`{${"folderId"}}`, encodeURIComponent(String(requestParameters.folderId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetFolderFromJSON(jsonValue));
    }

    /**
     * Returns a folder\'s details
     */
    async getFolder(requestParameters: GetFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetFolder> {
        const response = await this.getFolderRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get lists in a folder
     */
    async getFolderListsRaw(requestParameters: GetFolderListsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetFolderLists>> {
        if (requestParameters.folderId === null || requestParameters.folderId === undefined) {
            throw new runtime.RequiredError('folderId','Required parameter requestParameters.folderId was null or undefined when calling getFolderLists.');
        }

        const queryParameters: any = {};

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        if (requestParameters.offset !== undefined) {
            queryParameters['offset'] = requestParameters.offset;
        }

        if (requestParameters.sort !== undefined) {
            queryParameters['sort'] = requestParameters.sort;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/folders/{folderId}/lists`.replace(`{${"folderId"}}`, encodeURIComponent(String(requestParameters.folderId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetFolderListsFromJSON(jsonValue));
    }

    /**
     * Get lists in a folder
     */
    async getFolderLists(requestParameters: GetFolderListsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetFolderLists> {
        const response = await this.getFolderListsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get all folders
     */
    async getFoldersRaw(requestParameters: GetFoldersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetFolders>> {
        if (requestParameters.limit === null || requestParameters.limit === undefined) {
            throw new runtime.RequiredError('limit','Required parameter requestParameters.limit was null or undefined when calling getFolders.');
        }

        if (requestParameters.offset === null || requestParameters.offset === undefined) {
            throw new runtime.RequiredError('offset','Required parameter requestParameters.offset was null or undefined when calling getFolders.');
        }

        const queryParameters: any = {};

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        if (requestParameters.offset !== undefined) {
            queryParameters['offset'] = requestParameters.offset;
        }

        if (requestParameters.sort !== undefined) {
            queryParameters['sort'] = requestParameters.sort;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/folders`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetFoldersFromJSON(jsonValue));
    }

    /**
     * Get all folders
     */
    async getFolders(requestParameters: GetFoldersRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetFolders> {
        const response = await this.getFoldersRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update a folder
     */
    async updateFolderRaw(requestParameters: UpdateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.folderId === null || requestParameters.folderId === undefined) {
            throw new runtime.RequiredError('folderId','Required parameter requestParameters.folderId was null or undefined when calling updateFolder.');
        }

        if (requestParameters.updateFolder === null || requestParameters.updateFolder === undefined) {
            throw new runtime.RequiredError('updateFolder','Required parameter requestParameters.updateFolder was null or undefined when calling updateFolder.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/contacts/folders/{folderId}`.replace(`{${"folderId"}}`, encodeURIComponent(String(requestParameters.folderId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: CreateUpdateFolderToJSON(requestParameters.updateFolder),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Update a folder
     */
    async updateFolder(requestParameters: UpdateFolderRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.updateFolderRaw(requestParameters, initOverrides);
    }

}

/**
  * @export
  * @enum {string}
  */
export enum GetFolderListsSortEnum {
    Asc = 'asc',
    Desc = 'desc'
}
/**
  * @export
  * @enum {string}
  */
export enum GetFoldersSortEnum {
    Asc = 'asc',
    Desc = 'desc'
}
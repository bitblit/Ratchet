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
  ErrorModel,
  GetProcess,
  GetProcesses,
} from '../models/index.js';
import {
    ErrorModelFromJSON,
    ErrorModelToJSON,
    GetProcessFromJSON,
    GetProcessToJSON,
    GetProcessesFromJSON,
    GetProcessesToJSON,
} from '../models/index.js';

export interface GetProcessRequest {
    processId: number;
}

export interface GetProcessesRequest {
    limit?: number;
    offset?: number;
}

/**
 * ProcessApi - interface
 * 
 * @export
 * @interface ProcessApiInterface
 */
export interface ProcessApiInterface {
    /**
     * 
     * @summary Return the informations for a process
     * @param {number} processId Id of the process
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProcessApiInterface
     */
    getProcessRaw(requestParameters: GetProcessRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetProcess>>;

    /**
     * Return the informations for a process
     */
    getProcess(requestParameters: GetProcessRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetProcess>;

    /**
     * 
     * @summary Return all the processes for your account
     * @param {number} [limit] Number limitation for the result returned
     * @param {number} [offset] Beginning point in the list to retrieve from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProcessApiInterface
     */
    getProcessesRaw(requestParameters: GetProcessesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetProcesses>>;

    /**
     * Return all the processes for your account
     */
    getProcesses(requestParameters: GetProcessesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetProcesses>;

}

/**
 * 
 */
export class ProcessApi extends runtime.BaseAPI implements ProcessApiInterface {

    /**
     * Return the informations for a process
     */
    async getProcessRaw(requestParameters: GetProcessRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetProcess>> {
        if (requestParameters.processId === null || requestParameters.processId === undefined) {
            throw new runtime.RequiredError('processId','Required parameter requestParameters.processId was null or undefined when calling getProcess.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/processes/{processId}`.replace(`{${"processId"}}`, encodeURIComponent(String(requestParameters.processId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetProcessFromJSON(jsonValue));
    }

    /**
     * Return the informations for a process
     */
    async getProcess(requestParameters: GetProcessRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetProcess> {
        const response = await this.getProcessRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Return all the processes for your account
     */
    async getProcessesRaw(requestParameters: GetProcessesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetProcesses>> {
        const queryParameters: any = {};

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        if (requestParameters.offset !== undefined) {
            queryParameters['offset'] = requestParameters.offset;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["api-key"] = await this.configuration.apiKey("api-key"); // api-key authentication
        }

        const response = await this.request({
            path: `/processes`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetProcessesFromJSON(jsonValue));
    }

    /**
     * Return all the processes for your account
     */
    async getProcesses(requestParameters: GetProcessesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetProcesses> {
        const response = await this.getProcessesRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
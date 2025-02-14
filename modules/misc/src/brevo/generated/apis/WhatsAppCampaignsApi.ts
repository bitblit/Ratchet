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
import type { GetWATemplates, GetWhatsappCampaignOverview, GetWhatsappCampaigns } from '../models/index.js';
import { GetWATemplatesFromJSON, GetWhatsappCampaignOverviewFromJSON, GetWhatsappCampaignsFromJSON } from '../models/index.js';

export interface DeleteWhatsAppCampaignRequest {
  campaignId: number;
}

export interface GetWhatsAppCampaignRequest {
  campaignId: number;
}

export interface GetWhatsAppCampaignsRequest {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sort?: GetWhatsAppCampaignsSortEnum;
}

export interface GetWhatsAppTemplatesRequest {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sort?: GetWhatsAppTemplatesSortEnum;
}

/**
 * WhatsAppCampaignsApi - interface
 *
 * @export
 * @interface WhatsAppCampaignsApiInterface
 */
export interface WhatsAppCampaignsApiInterface {
  /**
   *
   * @summary Delete a WhatsApp campaign
   * @param {number} campaignId id of the campaign
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof WhatsAppCampaignsApiInterface
   */
  deleteWhatsAppCampaignRaw(
    requestParameters: DeleteWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>>;

  /**
   * Delete a WhatsApp campaign
   */
  deleteWhatsAppCampaign(
    requestParameters: DeleteWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void>;

  /**
   *
   * @summary Get a WhatsApp campaign
   * @param {number} campaignId Id of the campaign
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof WhatsAppCampaignsApiInterface
   */
  getWhatsAppCampaignRaw(
    requestParameters: GetWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetWhatsappCampaignOverview>>;

  /**
   * Get a WhatsApp campaign
   */
  getWhatsAppCampaign(
    requestParameters: GetWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetWhatsappCampaignOverview>;

  /**
   *
   * @summary Return all your created WhatsApp campaigns
   * @param {string} [startDate] **Mandatory if endDate is used**. Starting (urlencoded) UTC date-time (YYYY-MM-DDTHH:mm:ss.SSSZ) to filter the campaigns created. **Prefer to pass your timezone in date-time format for accurate result**
   * @param {string} [endDate] **Mandatory if startDate is used**. Ending (urlencoded) UTC date-time (YYYY-MM-DDTHH:mm:ss.SSSZ) to filter the campaigns created. **Prefer to pass your timezone in date-time format for accurate result**
   * @param {number} [limit] Number of documents per page
   * @param {number} [offset] Index of the first document in the page
   * @param {'asc' | 'desc'} [sort] Sort the results in the ascending/descending order of record modification. Default order is **descending** if &#x60;sort&#x60; is not passed
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof WhatsAppCampaignsApiInterface
   */
  getWhatsAppCampaignsRaw(
    requestParameters: GetWhatsAppCampaignsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetWhatsappCampaigns>>;

  /**
   * Return all your created WhatsApp campaigns
   */
  getWhatsAppCampaigns(
    requestParameters: GetWhatsAppCampaignsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetWhatsappCampaigns>;

  /**
   *
   * @summary Return all your created WhatsApp templates
   * @param {string} [startDate] **Mandatory if endDate is used**. Starting (urlencoded) UTC date-time (YYYY-MM-DDTHH:mm:ss.SSSZ) to filter the templates created. **Prefer to pass your timezone in date-time format for accurate result**
   * @param {string} [endDate] **Mandatory if startDate is used**. Ending (urlencoded) UTC date-time (YYYY-MM-DDTHH:mm:ss.SSSZ) to filter the templates created. **Prefer to pass your timezone in date-time format for accurate result**
   * @param {number} [limit] Number of documents per page
   * @param {number} [offset] Index of the first document in the page
   * @param {'asc' | 'desc'} [sort] Sort the results in the ascending/descending order of record modification. Default order is **descending** if &#x60;sort&#x60; is not passed
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof WhatsAppCampaignsApiInterface
   */
  getWhatsAppTemplatesRaw(
    requestParameters: GetWhatsAppTemplatesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetWATemplates>>;

  /**
   * Return all your created WhatsApp templates
   */
  getWhatsAppTemplates(
    requestParameters: GetWhatsAppTemplatesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetWATemplates>;
}

/**
 *
 */
export class WhatsAppCampaignsApi extends runtime.BaseAPI implements WhatsAppCampaignsApiInterface {
  /**
   * Delete a WhatsApp campaign
   */
  async deleteWhatsAppCampaignRaw(
    requestParameters: DeleteWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.campaignId === null || requestParameters.campaignId === undefined) {
      throw new runtime.RequiredError(
        'campaignId',
        'Required parameter requestParameters.campaignId was null or undefined when calling deleteWhatsAppCampaign.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.apiKey) {
      headerParameters['api-key'] = await this.configuration.apiKey('api-key'); // api-key authentication
    }

    const response = await this.request(
      {
        path: `/whatsappCampaigns/{campaignId}`.replace(`{${'campaignId'}}`, encodeURIComponent(String(requestParameters.campaignId))),
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a WhatsApp campaign
   */
  async deleteWhatsAppCampaign(
    requestParameters: DeleteWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<void> {
    await this.deleteWhatsAppCampaignRaw(requestParameters, initOverrides);
  }

  /**
   * Get a WhatsApp campaign
   */
  async getWhatsAppCampaignRaw(
    requestParameters: GetWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetWhatsappCampaignOverview>> {
    if (requestParameters.campaignId === null || requestParameters.campaignId === undefined) {
      throw new runtime.RequiredError(
        'campaignId',
        'Required parameter requestParameters.campaignId was null or undefined when calling getWhatsAppCampaign.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.apiKey) {
      headerParameters['api-key'] = await this.configuration.apiKey('api-key'); // api-key authentication
    }

    const response = await this.request(
      {
        path: `/whatsappCampaigns/{campaignId}`.replace(`{${'campaignId'}}`, encodeURIComponent(String(requestParameters.campaignId))),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetWhatsappCampaignOverviewFromJSON(jsonValue));
  }

  /**
   * Get a WhatsApp campaign
   */
  async getWhatsAppCampaign(
    requestParameters: GetWhatsAppCampaignRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetWhatsappCampaignOverview> {
    const response = await this.getWhatsAppCampaignRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Return all your created WhatsApp campaigns
   */
  async getWhatsAppCampaignsRaw(
    requestParameters: GetWhatsAppCampaignsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetWhatsappCampaigns>> {
    const queryParameters: any = {};

    if (requestParameters.startDate !== undefined) {
      queryParameters['startDate'] = requestParameters.startDate;
    }

    if (requestParameters.endDate !== undefined) {
      queryParameters['endDate'] = requestParameters.endDate;
    }

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
      headerParameters['api-key'] = await this.configuration.apiKey('api-key'); // api-key authentication
    }

    const response = await this.request(
      {
        path: `/whatsappCampaigns`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetWhatsappCampaignsFromJSON(jsonValue));
  }

  /**
   * Return all your created WhatsApp campaigns
   */
  async getWhatsAppCampaigns(
    requestParameters: GetWhatsAppCampaignsRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetWhatsappCampaigns> {
    const response = await this.getWhatsAppCampaignsRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Return all your created WhatsApp templates
   */
  async getWhatsAppTemplatesRaw(
    requestParameters: GetWhatsAppTemplatesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetWATemplates>> {
    const queryParameters: any = {};

    if (requestParameters.startDate !== undefined) {
      queryParameters['startDate'] = requestParameters.startDate;
    }

    if (requestParameters.endDate !== undefined) {
      queryParameters['endDate'] = requestParameters.endDate;
    }

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
      headerParameters['api-key'] = await this.configuration.apiKey('api-key'); // api-key authentication
    }

    const response = await this.request(
      {
        path: `/whatsappCampaigns/template-list`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetWATemplatesFromJSON(jsonValue));
  }

  /**
   * Return all your created WhatsApp templates
   */
  async getWhatsAppTemplates(
    requestParameters: GetWhatsAppTemplatesRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetWATemplates> {
    const response = await this.getWhatsAppTemplatesRaw(requestParameters, initOverrides);
    return await response.value();
  }
}

/**
 * @export
 * @enum {string}
 */
export enum GetWhatsAppCampaignsSortEnum {
  Asc = 'asc',
  Desc = 'desc',
}
/**
 * @export
 * @enum {string}
 */
export enum GetWhatsAppTemplatesSortEnum {
  Asc = 'asc',
  Desc = 'desc',
}

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
  GetSmsEventReport,
  GetTransacAggregatedSmsReport,
  GetTransacSmsReport,
  SendSms,
  SendTransacSms,
} from '../models/index.js';
import {
  ErrorModelFromJSON,
  ErrorModelToJSON,
  GetSmsEventReportFromJSON,
  GetSmsEventReportToJSON,
  GetTransacAggregatedSmsReportFromJSON,
  GetTransacAggregatedSmsReportToJSON,
  GetTransacSmsReportFromJSON,
  GetTransacSmsReportToJSON,
  SendSmsFromJSON,
  SendSmsToJSON,
  SendTransacSmsFromJSON,
  SendTransacSmsToJSON,
} from '../models/index.js';

export interface GetSmsEventsRequest {
  limit?: number;
  startDate?: string;
  endDate?: string;
  offset?: number;
  days?: number;
  phoneNumber?: string;
  event?: GetSmsEventsEventEnum;
  tags?: string;
  sort?: GetSmsEventsSortEnum;
}

export interface GetTransacAggregatedSmsReportRequest {
  startDate?: string;
  endDate?: string;
  days?: number;
  tag?: string;
}

export interface GetTransacSmsReportRequest {
  startDate?: string;
  endDate?: string;
  days?: number;
  tag?: string;
  sort?: GetTransacSmsReportSortEnum;
}

export interface SendTransacSmsRequest {
  sendTransacSms: SendTransacSms;
}

/**
 * TransactionalSMSApi - interface
 *
 * @export
 * @interface TransactionalSMSApiInterface
 */
export interface TransactionalSMSApiInterface {
  /**
   *
   * @summary Get all your SMS activity (unaggregated events)
   * @param {number} [limit] Number of documents per page
   * @param {string} [startDate] Mandatory if endDate is used. Starting date (YYYY-MM-DD) of the report
   * @param {string} [endDate] Mandatory if startDate is used. Ending date (YYYY-MM-DD) of the report
   * @param {number} [offset] Index of the first document of the page
   * @param {number} [days] Number of days in the past including today (positive integer). Not compatible with \&#39;startDate\&#39; and \&#39;endDate\&#39;
   * @param {string} [phoneNumber] Filter the report for a specific phone number
   * @param {'bounces' | 'hardBounces' | 'softBounces' | 'delivered' | 'sent' | 'accepted' | 'unsubscription' | 'replies' | 'blocked' | 'rejected'} [event] Filter the report for specific events
   * @param {string} [tags] Filter the report for specific tags passed as a serialized urlencoded array
   * @param {'asc' | 'desc'} [sort] Sort the results in the ascending/descending order of record creation
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TransactionalSMSApiInterface
   */
  getSmsEventsRaw(
    requestParameters: GetSmsEventsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetSmsEventReport>>;

  /**
   * Get all your SMS activity (unaggregated events)
   */
  getSmsEvents(
    requestParameters: GetSmsEventsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetSmsEventReport>;

  /**
   *
   * @summary Get your SMS activity aggregated over a period of time
   * @param {string} [startDate] Mandatory if endDate is used. Starting date (YYYY-MM-DD) of the report
   * @param {string} [endDate] Mandatory if startDate is used. Ending date (YYYY-MM-DD) of the report
   * @param {number} [days] Number of days in the past including today (positive integer). Not compatible with startDate and endDate
   * @param {string} [tag] Filter on a tag
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TransactionalSMSApiInterface
   */
  getTransacAggregatedSmsReportRaw(
    requestParameters: GetTransacAggregatedSmsReportRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetTransacAggregatedSmsReport>>;

  /**
   * Get your SMS activity aggregated over a period of time
   */
  getTransacAggregatedSmsReport(
    requestParameters: GetTransacAggregatedSmsReportRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetTransacAggregatedSmsReport>;

  /**
   *
   * @summary Get your SMS activity aggregated per day
   * @param {string} [startDate] Mandatory if endDate is used. Starting date (YYYY-MM-DD) of the report
   * @param {string} [endDate] Mandatory if startDate is used. Ending date (YYYY-MM-DD) of the report
   * @param {number} [days] Number of days in the past including today (positive integer). Not compatible with \&#39;startDate\&#39; and \&#39;endDate\&#39;
   * @param {string} [tag] Filter on a tag
   * @param {'asc' | 'desc'} [sort] Sort the results in the ascending/descending order of record creation
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TransactionalSMSApiInterface
   */
  getTransacSmsReportRaw(
    requestParameters: GetTransacSmsReportRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetTransacSmsReport>>;

  /**
   * Get your SMS activity aggregated per day
   */
  getTransacSmsReport(
    requestParameters: GetTransacSmsReportRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetTransacSmsReport>;

  /**
   *
   * @summary Send SMS message to a mobile number
   * @param {SendTransacSms} sendTransacSms Values to send a transactional SMS
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TransactionalSMSApiInterface
   */
  sendTransacSmsRaw(
    requestParameters: SendTransacSmsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<SendSms>>;

  /**
   * Send SMS message to a mobile number
   */
  sendTransacSms(requestParameters: SendTransacSmsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<SendSms>;
}

/**
 *
 */
export class TransactionalSMSApi extends runtime.BaseAPI implements TransactionalSMSApiInterface {
  /**
   * Get all your SMS activity (unaggregated events)
   */
  async getSmsEventsRaw(
    requestParameters: GetSmsEventsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetSmsEventReport>> {
    const queryParameters: any = {};

    if (requestParameters.limit !== undefined) {
      queryParameters['limit'] = requestParameters.limit;
    }

    if (requestParameters.startDate !== undefined) {
      queryParameters['startDate'] = requestParameters.startDate;
    }

    if (requestParameters.endDate !== undefined) {
      queryParameters['endDate'] = requestParameters.endDate;
    }

    if (requestParameters.offset !== undefined) {
      queryParameters['offset'] = requestParameters.offset;
    }

    if (requestParameters.days !== undefined) {
      queryParameters['days'] = requestParameters.days;
    }

    if (requestParameters.phoneNumber !== undefined) {
      queryParameters['phoneNumber'] = requestParameters.phoneNumber;
    }

    if (requestParameters.event !== undefined) {
      queryParameters['event'] = requestParameters.event;
    }

    if (requestParameters.tags !== undefined) {
      queryParameters['tags'] = requestParameters.tags;
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
        path: `/transactionalSMS/statistics/events`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetSmsEventReportFromJSON(jsonValue));
  }

  /**
   * Get all your SMS activity (unaggregated events)
   */
  async getSmsEvents(
    requestParameters: GetSmsEventsRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetSmsEventReport> {
    const response = await this.getSmsEventsRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Get your SMS activity aggregated over a period of time
   */
  async getTransacAggregatedSmsReportRaw(
    requestParameters: GetTransacAggregatedSmsReportRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetTransacAggregatedSmsReport>> {
    const queryParameters: any = {};

    if (requestParameters.startDate !== undefined) {
      queryParameters['startDate'] = requestParameters.startDate;
    }

    if (requestParameters.endDate !== undefined) {
      queryParameters['endDate'] = requestParameters.endDate;
    }

    if (requestParameters.days !== undefined) {
      queryParameters['days'] = requestParameters.days;
    }

    if (requestParameters.tag !== undefined) {
      queryParameters['tag'] = requestParameters.tag;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.apiKey) {
      headerParameters['api-key'] = await this.configuration.apiKey('api-key'); // api-key authentication
    }

    const response = await this.request(
      {
        path: `/transactionalSMS/statistics/aggregatedReport`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetTransacAggregatedSmsReportFromJSON(jsonValue));
  }

  /**
   * Get your SMS activity aggregated over a period of time
   */
  async getTransacAggregatedSmsReport(
    requestParameters: GetTransacAggregatedSmsReportRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetTransacAggregatedSmsReport> {
    const response = await this.getTransacAggregatedSmsReportRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Get your SMS activity aggregated per day
   */
  async getTransacSmsReportRaw(
    requestParameters: GetTransacSmsReportRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<GetTransacSmsReport>> {
    const queryParameters: any = {};

    if (requestParameters.startDate !== undefined) {
      queryParameters['startDate'] = requestParameters.startDate;
    }

    if (requestParameters.endDate !== undefined) {
      queryParameters['endDate'] = requestParameters.endDate;
    }

    if (requestParameters.days !== undefined) {
      queryParameters['days'] = requestParameters.days;
    }

    if (requestParameters.tag !== undefined) {
      queryParameters['tag'] = requestParameters.tag;
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
        path: `/transactionalSMS/statistics/reports`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => GetTransacSmsReportFromJSON(jsonValue));
  }

  /**
   * Get your SMS activity aggregated per day
   */
  async getTransacSmsReport(
    requestParameters: GetTransacSmsReportRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<GetTransacSmsReport> {
    const response = await this.getTransacSmsReportRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Send SMS message to a mobile number
   */
  async sendTransacSmsRaw(
    requestParameters: SendTransacSmsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<SendSms>> {
    if (requestParameters.sendTransacSms === null || requestParameters.sendTransacSms === undefined) {
      throw new runtime.RequiredError(
        'sendTransacSms',
        'Required parameter requestParameters.sendTransacSms was null or undefined when calling sendTransacSms.',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    if (this.configuration && this.configuration.apiKey) {
      headerParameters['api-key'] = await this.configuration.apiKey('api-key'); // api-key authentication
    }

    const response = await this.request(
      {
        path: `/transactionalSMS/sms`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: SendTransacSmsToJSON(requestParameters.sendTransacSms),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) => SendSmsFromJSON(jsonValue));
  }

  /**
   * Send SMS message to a mobile number
   */
  async sendTransacSms(
    requestParameters: SendTransacSmsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<SendSms> {
    const response = await this.sendTransacSmsRaw(requestParameters, initOverrides);
    return await response.value();
  }
}

/**
 * @export
 * @enum {string}
 */
export enum GetSmsEventsEventEnum {
  Bounces = 'bounces',
  HardBounces = 'hardBounces',
  SoftBounces = 'softBounces',
  Delivered = 'delivered',
  Sent = 'sent',
  Accepted = 'accepted',
  Unsubscription = 'unsubscription',
  Replies = 'replies',
  Blocked = 'blocked',
  Rejected = 'rejected',
}
/**
 * @export
 * @enum {string}
 */
export enum GetSmsEventsSortEnum {
  Asc = 'asc',
  Desc = 'desc',
}
/**
 * @export
 * @enum {string}
 */
export enum GetTransacSmsReportSortEnum {
  Asc = 'asc',
  Desc = 'desc',
}

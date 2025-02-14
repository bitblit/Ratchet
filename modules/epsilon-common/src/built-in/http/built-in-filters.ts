import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { RestfulApiHttpError } from '@bitblit/ratchet-common/network/restful-api-http-error';
import { MapRatchet } from '@bitblit/ratchet-common/lang/map-ratchet';
import { EventUtil } from '../../http/event-util.js';
import { BadRequestError } from '../../http/error/bad-request-error.js';
import { FilterFunction } from '../../config/http/filter-function.js';
import { ResponseUtil } from '../../http/response-util.js';
import { FilterChainContext } from '../../config/http/filter-chain-context.js';
import { MisconfiguredError } from '../../http/error/misconfigured-error.js';
import { APIGatewayProxyResult } from 'aws-lambda';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { EpsilonCorsApproach } from '../../config/http/epsilon-cors-approach.js';

export class BuiltInFilters {
  public static readonly MAXIMUM_LAMBDA_BODY_SIZE_BYTES: number = 1024 * 1024 * 5 - 1024 * 100; // 5Mb - 100k buffer

  public static async combineFilters(fCtx: FilterChainContext, filters: FilterFunction[]): Promise<boolean> {
    let cont: boolean = true;
    if (filters && filters.length > 0) {
      for (let i = 0; i < filters.length && cont; i++) {
        cont = await filters[i](fCtx);
      }
    }
    return cont;
  }

  public static async applyGzipIfPossible(fCtx: FilterChainContext): Promise<boolean> {
    if (fCtx.event?.headers && fCtx.result) {
      const encodingHeader: string =
        fCtx.event && fCtx.event.headers ? MapRatchet.extractValueFromMapIgnoreCase(fCtx.event.headers, 'accept-encoding') : null;
      fCtx.result = await ResponseUtil.applyGzipIfPossible(encodingHeader, fCtx.result);
    }
    return true;
  }

  public static async addConstantHeaders(fCtx: FilterChainContext, headers: Record<string, string>): Promise<boolean> {
    if (headers && fCtx.result) {
      fCtx.result.headers = Object.assign({}, headers, fCtx.result.headers);
    } else {
      Logger.warn('Could not add headers - either result or headers were missing');
    }
    return true;
  }

  public static async addAWSRequestIdHeader(fCtx: FilterChainContext, headerName: string = 'X-REQUEST-ID'): Promise<boolean> {
    if (fCtx.result && StringRatchet.trimToNull(headerName) && headerName.startsWith('X-')) {
      fCtx.result.headers = fCtx.result.headers || {};
      fCtx.result.headers[headerName] = fCtx.context?.awsRequestId || 'Request-Id-Missing';
    } else {
      Logger.warn('Could not add request id header - either result or context were missing or name was invalid');
    }
    return true;
  }

  public static async addAllowEverythingCORSHeaders(fCtx: FilterChainContext): Promise<boolean> {
    return BuiltInFilters.addConstantHeaders(fCtx, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    });
  }

  public static async addAllowReflectionCORSHeaders(fCtx: FilterChainContext): Promise<boolean> {
    return BuiltInFilters.addConstantHeaders(fCtx, {
      'Access-Control-Allow-Origin': MapRatchet.caseInsensitiveAccess<string>(fCtx.event.headers, 'Origin') || '*',
      'Access-Control-Allow-Methods': MapRatchet.caseInsensitiveAccess<string>(fCtx.event.headers, 'Access-Control-Request-Method') || '*',
      'Access-Control-Allow-Headers': MapRatchet.caseInsensitiveAccess<string>(fCtx.event.headers, 'Access-Control-Request-Headers') || '*',
    });
  }

  public static async uriDecodeQueryParams(fCtx: FilterChainContext): Promise<boolean> {
    if (fCtx?.event?.queryStringParameters) {
      Object.keys(fCtx.event.queryStringParameters).forEach((k) => {
        const val: string = fCtx.event.queryStringParameters[k];
        if (val) {
          fCtx.event.queryStringParameters[k] = BuiltInFilters.decodeUriComponentAndReplacePlus(val);
        }
      });
    }
    if (fCtx?.event?.multiValueQueryStringParameters) {
      Object.keys(fCtx.event.multiValueQueryStringParameters).forEach((k) => {
        const val: string[] = fCtx.event.multiValueQueryStringParameters[k];
        if (val && val.length) {
          const cleaned: string[] = val.map((v) => BuiltInFilters.decodeUriComponentAndReplacePlus(v));
          fCtx.event.multiValueQueryStringParameters[k] = cleaned;
        }
      });
    }
    return true;
  }

  /**
   * Performs decodeURIComponent on a value after replacing all "+" values with spaces.
   */
  private static decodeUriComponentAndReplacePlus(val: string): string {
    return decodeURIComponent(val.replace(/\+/g, ' '));
  }

  public static async fixStillEncodedQueryParams(fCtx: FilterChainContext): Promise<boolean> {
    EventUtil.fixStillEncodedQueryParams(fCtx.event);
    return true;
  }

  /**
   * Basically used to restrict a server to only running on an internal network (weakly, this isn't
   * ironclad at ALL) examines the hostname header to see if what was requested matches a particular
   * host
   * @param hostnameRegExList
   */
  public static createRestrictServerToHostNamesFilter(hostnameRegExList: RegExp[]): FilterFunction {
    RequireRatchet.notNullUndefinedOrEmptyArray(hostnameRegExList, 'hostnameRegExList');
    return async (fCtx: FilterChainContext) => {
      const hostName: string = StringRatchet.trimToNull(MapRatchet.extractValueFromMapIgnoreCase(fCtx?.event?.headers, 'host'));
      if (!StringRatchet.trimToNull(hostName)) {
        throw new BadRequestError('No host name found in headers : ' + JSON.stringify(fCtx?.event?.headers));
      }
      const hostMatches: boolean = EventUtil.hostMatchesRegexInList(hostName, hostnameRegExList);
      if (!hostMatches) {
        throw new BadRequestError('Host does not match list : ' + hostName + ' :: ' + hostnameRegExList);
      }
      return true;
    };
  }

  public static async disallowStringNullAsPathParameter(fCtx: FilterChainContext): Promise<boolean> {
    if (fCtx?.event?.pathParameters) {
      Object.keys(fCtx.event.pathParameters).forEach((k) => {
        if ('null' === StringRatchet.trimToEmpty(fCtx.event.pathParameters[k]).toLowerCase()) {
          throw new BadRequestError().withFormattedErrorMessage('Path parameter %s was string -null-', k);
        }
      });
    }
    return true;
  }

  public static async disallowStringNullAsQueryStringParameter(fCtx: FilterChainContext): Promise<boolean> {
    if (fCtx?.event?.queryStringParameters) {
      Object.keys(fCtx.event.queryStringParameters).forEach((k) => {
        if ('null' === StringRatchet.trimToEmpty(fCtx.event.queryStringParameters[k]).toLowerCase()) {
          throw new BadRequestError().withFormattedErrorMessage('Query parameter %s was string -null-', k);
        }
      });
    }
    return true;
  }

  public static async ensureEventMaps(fCtx: FilterChainContext): Promise<boolean> {
    fCtx.event.queryStringParameters = fCtx.event.queryStringParameters || {};
    fCtx.event.headers = fCtx.event.headers || {};
    fCtx.event.pathParameters = fCtx.event.pathParameters || {};
    return true;
  }

  public static async parseJsonBodyToObject(fCtx: FilterChainContext): Promise<boolean> {
    if (fCtx.event?.body) {
      try {
        fCtx.event.parsedBody = EventUtil.jsonBodyToObject(fCtx.event);
      } catch (err) {
        throw new RestfulApiHttpError('Supplied body was not parsable as valid JSON').withHttpStatusCode(400).withWrappedError(err);
      }
    }
    return true;
  }

  public static async checkMaximumLambdaBodySize(fCtx: FilterChainContext): Promise<boolean> {
    if (fCtx.result?.body && fCtx.result.body.length > BuiltInFilters.MAXIMUM_LAMBDA_BODY_SIZE_BYTES) {
      const delta: number = fCtx.result.body.length - BuiltInFilters.MAXIMUM_LAMBDA_BODY_SIZE_BYTES;
      throw new RestfulApiHttpError(
        'Response size is ' + fCtx.result.body.length + ' bytes, which is ' + delta + ' bytes too large for this handler',
      ).withHttpStatusCode(500);
    }
    return true;
  }

  public static async validateInboundBody(fCtx: FilterChainContext): Promise<boolean> {
    if (fCtx?.event?.parsedBody && fCtx.routeAndParse) {
      if (fCtx.routeAndParse.mapping.validation) {
        if (!fCtx.modelValidator) {
          throw new MisconfiguredError('Requested body validation but supplied no validator');
        }
        const errors: string[] = fCtx.modelValidator.validate(
          fCtx.routeAndParse.mapping.validation.modelName,
          fCtx.event.parsedBody,
          fCtx.routeAndParse.mapping.validation.emptyAllowed,
          fCtx.routeAndParse.mapping.validation.extraPropertiesAllowed,
        );
        if (errors.length > 0) {
          Logger.info('Found errors while validating %s object %j', fCtx.routeAndParse.mapping.validation.modelName, errors);
          const newError: BadRequestError = new BadRequestError(...errors);
          throw newError;
        }
      }
    } else {
      Logger.debug('No validation since no route specified or no parsed body');
    }
    return true;
  }

  public static async validateInboundQueryParams(_fCtx: FilterChainContext): Promise<boolean> {
    // TODO: Implement ME!
    return true;
  }

  public static async validateInboundPathParams(_fCtx: FilterChainContext): Promise<boolean> {
    // TODO: Implement ME!
    return true;
  }

  public static async validateOutboundResponse(fCtx: FilterChainContext): Promise<boolean> {
    // Use !== true below because commonly it just wont be spec'd
    if (fCtx?.rawResult) {
      if (fCtx.routeAndParse.mapping.outboundValidation) {
        Logger.debug('Applying outbound check to %j', fCtx.rawResult);
        const errors: string[] = fCtx.modelValidator.validate(
          fCtx.routeAndParse.mapping.outboundValidation.modelName,
          fCtx.rawResult,
          fCtx.routeAndParse.mapping.outboundValidation.emptyAllowed,
          fCtx.routeAndParse.mapping.outboundValidation.extraPropertiesAllowed,
        );
        if (errors.length > 0) {
          Logger.error(
            'Found outbound errors while validating %s object %j',
            fCtx.routeAndParse.mapping.outboundValidation.modelName,
            errors,
          );
          errors.unshift('Server sent object invalid according to spec');
          throw new RestfulApiHttpError().withErrors(errors).withHttpStatusCode(500).withDetails(fCtx.rawResult);
        }
      } else {
        Logger.debug('Applied no outbound validation because none set');
      }
    } else {
      Logger.debug('No validation since no outbound body or disabled');
    }
    return true;
  }

  public static async autoRespondToOptionsRequestWithCors(
    fCtx: FilterChainContext,
    corsMethod: EpsilonCorsApproach = EpsilonCorsApproach.Reflective,
  ): Promise<boolean> {
    if (StringRatchet.trimToEmpty(fCtx?.event?.httpMethod).toLowerCase() === 'options') {
      fCtx.result = {
        statusCode: 200,
        body: '{"cors":true, "m":3}',
      };
      await BuiltInFilters.addCorsHeadersDynamically(fCtx, corsMethod);
      return false;
    } else {
      return true;
    }
  }

  public static async autoRespond(fCtx: FilterChainContext, inBody: any): Promise<boolean> {
    const body: any = inBody || {
      message: 'Not Implemented',
    };
    fCtx.result = {
      statusCode: 200,
      body: JSON.stringify(body),
    };
    return false;
  }

  public static async secureOutboundServerErrorForProduction(
    fCtx: FilterChainContext,
    errorMessage: string,
    errCode: number,
  ): Promise<boolean> {
    if (fCtx?.result?.statusCode) {
      if (errCode === null || fCtx.result.statusCode === errCode) {
        Logger.warn('Securing outbound error info (was : %j)', fCtx.result.body);
        fCtx.rawResult = new RestfulApiHttpError(errorMessage).withHttpStatusCode(fCtx.result.statusCode);
        const oldResult: APIGatewayProxyResult = fCtx.result;
        fCtx.result = ResponseUtil.errorResponse(fCtx.rawResult);
        // Need this to preserve any CORS headers, etc
        fCtx.result.headers = Object.assign({}, oldResult.headers || {}, fCtx.result.headers || {});
      }
    }
    return true;
  }

  public static async addCorsHeadersDynamically(fCtx: FilterChainContext, corsMethod: EpsilonCorsApproach): Promise<void> {
    if (corsMethod) {
      switch (corsMethod) {
        case EpsilonCorsApproach.All:
          await BuiltInFilters.addAllowEverythingCORSHeaders(fCtx);
          break;
        case EpsilonCorsApproach.Reflective:
          await BuiltInFilters.addAllowReflectionCORSHeaders(fCtx);
          break;
        default: // Also NONE
        // Do nothing
      }
    } else {
      Logger.warn('Called add CORS headers dynamically but no type supplied, using NONE');
    }
  }
}

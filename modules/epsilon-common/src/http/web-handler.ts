import { EpsilonRouter } from './route/epsilon-router.js';
import { APIGatewayEvent, Context, ProxyResult } from 'aws-lambda';

import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { RestfulApiHttpError } from '@bitblit/ratchet-common/network/restful-api-http-error';
import { ResponseUtil } from './response-util.js';
import { ExtendedAPIGatewayEvent } from '../config/http/extended-api-gateway-event.js';
import { BuiltInFilters } from '../built-in/http/built-in-filters.js';
import { HttpProcessingConfig } from '../config/http/http-processing-config.js';
import { FilterFunction } from '../config/http/filter-function.js';
import { RunHandlerAsFilter } from '../built-in/http/run-handler-as-filter.js';
import { FilterChainContext } from '../config/http/filter-chain-context.js';
import { ContextUtil } from '../util/context-util.js';
import { EpsilonLambdaEventHandler } from '../config/epsilon-lambda-event-handler.js';
import { LambdaEventDetector } from '@bitblit/ratchet-aws/lambda/lambda-event-detector';
import { RouteAndParse } from './route/route-and-parse.js';
import Route from 'route-parser';

/**
 * This class functions as the adapter from a default lambda function to the handlers exposed via Epsilon
 */
export class WebHandler implements EpsilonLambdaEventHandler<APIGatewayEvent> {
  public static readonly MAXIMUM_LAMBDA_BODY_SIZE_BYTES: number = 1024 * 1024 * 5 - 1024 * 100; // 5Mb - 100k buffer

  constructor(private routerConfig: EpsilonRouter) {
    RequireRatchet.notNullOrUndefined(routerConfig);
  }

  public get router(): EpsilonRouter {
    return this.routerConfig;
  }

  public extractLabel(evt: APIGatewayEvent, _context: Context): string {
    return 'WEB:' + StringRatchet.trimToEmpty(evt.httpMethod).toUpperCase() + ':' + evt.path;
  }

  public handlesEvent(evt: any): boolean {
    return LambdaEventDetector.isValidApiGatewayEvent(evt);
  }

  public async processEvent(event: APIGatewayEvent, context: Context): Promise<ProxyResult> {
    if (!this.routerConfig) {
      throw new Error('Router config not found');
    }
    const asExtended: ExtendedAPIGatewayEvent = Object.assign(
      {},
      { parsedBody: null, authorization: null, convertedFromV2Event: false },
      event,
    );
    const rval: ProxyResult = await this.openApiLambdaHandler(asExtended, context);
    ContextUtil.addTraceToProxyResult(rval);
    Logger.updateTracePrefix(null); // Just in case it was set
    return rval;
  }

  public async openApiLambdaHandler(evt: ExtendedAPIGatewayEvent, context: Context): Promise<ProxyResult> {
    const rm: RouteAndParse = this.findBestMatchingRoute(evt);
    const procConfig: HttpProcessingConfig = rm?.mapping?.metaProcessingConfig
      ? rm.mapping.metaProcessingConfig
      : this.routerConfig.config.defaultMetaHandling;
    const fCtx: FilterChainContext = {
      event: evt,
      context: context,
      result: null,
      rawResult: null,
      routeAndParse: rm,
      modelValidator: this.routerConfig.config.overrideModelValidator || this.routerConfig.openApiModelValidator,
      authenticators: this.routerConfig.config.authorizers,
    };

    try {
      let filterChain: FilterFunction[] = Object.assign([], procConfig.preFilters || []);
      RunHandlerAsFilter.addRunHandlerAsFilterToList(filterChain, rm);
      filterChain = filterChain.concat(procConfig.postFilters || []);
      await BuiltInFilters.combineFilters(fCtx, filterChain);
    } catch (err) {
      // Convert to an epsilon error
      const wrapper: RestfulApiHttpError = RestfulApiHttpError.wrapError(err as Error);
      fCtx.result = ResponseUtil.errorResponse(wrapper);
      try {
        await BuiltInFilters.combineFilters(fCtx, procConfig.errorFilters);
      } catch (convErr) {
        Logger.error('REALLY BAD - FAILED WHILE PROCESSING ERROR FILTERS : %s', convErr);
      }
    }
    return fCtx.result;
  }

  public findBestMatchingRoute(event: APIGatewayEvent): RouteAndParse {
    let rval: RouteAndParse = null;
    // See: https://www.npmjs.com/package/route-parser
    const cleanPath: string = this.cleanPath(event);

    // Filter routes to only matches
    const methodLower: string = event.httpMethod.toLowerCase();
    const matchRoutes: RouteAndParse[] = this.routerConfig.routes
      .map((r) => {
        let rval: RouteAndParse = null;
        if (r.method && r.method.toLowerCase() === methodLower) {
          const routeParser: Route = new Route(r.path);
          const parsed: any = routeParser.match(cleanPath);
          if (parsed !== false) {
            rval = {
              mapping: r,
              route: routeParser,
              parsed: parsed,
            };
          }
        }
        return rval;
      })
      .filter((r) => r != null);
    // Pick the 'best' match
    matchRoutes.sort((a, b) => {
      return Object.keys(a.parsed).length - Object.keys(b.parsed).length;
    });

    rval = matchRoutes && matchRoutes.length > 0 ? matchRoutes[0] : null;

    if (!rval) {
      Logger.debug(
        'Failed to find handler for %s (cleaned path was %s, strip prefixes were %j)',
        event.path,
        cleanPath,
        this.routerConfig.config.prefixesToStripBeforeRouteMatch,
      );
    }
    return rval;
  }

  private cleanPath(event: APIGatewayEvent): string {
    let rval: string = event.path;
    // First, strip any leading /
    while (rval.startsWith('/')) {
      rval = rval.substring(1);
    }
    // If there are any listed prefixes, strip them
    if (this.routerConfig.config.prefixesToStripBeforeRouteMatch) {
      this.routerConfig.config.prefixesToStripBeforeRouteMatch.forEach((prefix) => {
        if (rval.toLowerCase().startsWith(prefix.toLowerCase() + '/')) {
          rval = rval.substring(prefix.length);
        }
      });
    }

    // Strip any more leading /
    while (rval.startsWith('/')) {
      rval = rval.substring(1);
    }
    // Finally, put back exactly 1 leading / to match what comes out of open api
    rval = '/' + rval;

    return rval;
  }
}

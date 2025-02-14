import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { TimeoutToken } from '@bitblit/ratchet-common/lang/timeout-token';
import { RestfulApiHttpError } from '@bitblit/ratchet-common/network/restful-api-http-error';
import { Context } from 'aws-lambda';
import { ExtendedAPIGatewayEvent } from '../../config/http/extended-api-gateway-event.js';
import { RequestTimeoutError } from '../../http/error/request-timeout-error.js';
import { ResponseUtil } from '../../http/response-util.js';
import { NotFoundError } from '../../http/error/not-found-error.js';
import { NullReturnedObjectHandling } from '../../config/http/null-returned-object-handling.js';
import { FilterFunction } from '../../config/http/filter-function.js';
import { FilterChainContext } from '../../config/http/filter-chain-context.js';
import { RouteAndParse } from '../../http/route/route-and-parse.js';

export class RunHandlerAsFilter {
  public static async runHandler(fCtx: FilterChainContext, rm: RouteAndParse): Promise<boolean> {
    // Check for continue
    // Run the controller
    const handler: Promise<any> = RunHandlerAsFilter.findHandler(rm, fCtx.event, fCtx.context);
    Logger.debug('Processing event with epsilon: %j', RunHandlerAsFilter.eventToStringForLog(fCtx.event));
    let tmp: any = await handler;
    if (TimeoutToken.isTimeoutToken(tmp)) {
      (tmp as TimeoutToken).writeToLog();
      throw new RequestTimeoutError('Timed out');
    }
    Logger.debug('Initial return value : %j', tmp);
    tmp = RunHandlerAsFilter.applyNullReturnedObjectHandling(tmp, rm.mapping.metaProcessingConfig.nullReturnedObjectHandling);
    fCtx.rawResult = tmp;
    fCtx.result = ResponseUtil.coerceToProxyResult(tmp);

    return true;
  }

  public static applyNullReturnedObjectHandling(result: any, handling: NullReturnedObjectHandling): any {
    let rval: any = result;
    if (result === null || result === undefined) {
      if (handling === NullReturnedObjectHandling.Error) {
        Logger.error('Null object returned and Error specified, throwing 500');
        throw new RestfulApiHttpError('Null object').withHttpStatusCode(500);
      } else if (handling === NullReturnedObjectHandling.Return404NotFoundResponse) {
        throw new NotFoundError('Resource not found');
      } else if (handling === NullReturnedObjectHandling.ConvertToEmptyString) {
        Logger.warn('Null object returned from handler and convert not specified, converting to empty string');
        rval = '';
      } else {
        throw new RestfulApiHttpError('Cant happen - failed enum check').withHttpStatusCode(500);
      }
    }
    return rval;
  }

  public static async findHandler(
    rm: RouteAndParse,
    event: ExtendedAPIGatewayEvent,
    context: Context,
    add404OnMissing: boolean = true,
  ): Promise<any> {
    let rval: Promise<any> = null;
    // Execute
    if (rm) {
      // We extend with the parsed params here in case we are using the AWS any proxy
      event.pathParameters = Object.assign({}, event.pathParameters, rm.parsed);

      rval = PromiseRatchet.timeout(
        rm.mapping.function(event, context),
        'Timed out after ' +
          rm.mapping.metaProcessingConfig.timeoutMS +
          ' ms.  Request was ' +
          RunHandlerAsFilter.eventToStringForLog(event),
        rm.mapping.metaProcessingConfig.timeoutMS,
      );
    } else if (add404OnMissing) {
      throw new NotFoundError('No such endpoint');
    }
    return rval;
  }

  public static addRunHandlerAsFilterToList(filters: FilterFunction[], rm: RouteAndParse): void {
    if (filters) {
      filters.push((fCtx) => RunHandlerAsFilter.runHandler(fCtx, rm));
    }
  }

  private static eventToStringForLog(event: any): string {
    const eventToLog = structuredClone(event);

    if (eventToLog?.authorization?.raw) {
      eventToLog.authorization.raw = RunHandlerAsFilter.redact(eventToLog.authorization.raw);
    }
    if (eventToLog?.headers?.authorization) {
      eventToLog.headers.authorization = RunHandlerAsFilter.redact(eventToLog.headers.authorization);
    }

    return JSON.stringify(eventToLog);
  }

  public static redact(input: string): string {
    const rval: string = input ? StringRatchet.obscure(input, 1, 1) : input;
    return rval;
  }
}

import { Logger } from '@bitblit/ratchet-common';
import { APIGatewayEvent, Context, ProxyResult } from 'aws-lambda';
import { PromiseRatchet } from '@bitblit/ratchet-common';
import { TimeoutToken } from '@bitblit/ratchet-common';
import { RequestTimeoutError } from '../../http/error/request-timeout-error.js';
import { FilterFunction } from '../../config/http/filter-function.js';
import { FilterChainContext } from '../../config/http/filter-chain-context.js';
import { StringRatchet } from '@bitblit/ratchet-common';
import { ApolloServer, BaseContext, ContextFunction, HTTPGraphQLRequest, HeaderMap, HTTPGraphQLResponse } from '@apollo/server';
import { RequireRatchet } from '@bitblit/ratchet-common';
import { Base64Ratchet } from '@bitblit/ratchet-common';
import { EpsilonHttpError } from '../../http/error/epsilon-http-error.js';
import { ContextUtil } from '../../util/context-util.js';
import { EpsilonLambdaApolloOptions } from './apollo/epsilon-lambda-apollo-options.js';
import { EpsilonLambdaApolloContextFunctionArgument } from './apollo/epsilon-lambda-apollo-context-function-argument.js';
import { ApolloUtil } from './apollo/apollo-util.js';

export class ApolloFilter {
  public static async handlePathWithApollo<T>(
    fCtx: FilterChainContext,
    apolloPathRegex: RegExp,
    apolloServer: ApolloServer<T>,
    options?: EpsilonLambdaApolloOptions<T>
  ): Promise<boolean> {
    if (fCtx.event?.path && apolloPathRegex && apolloPathRegex.test(fCtx.event.path)) {
      fCtx.result = await ApolloFilter.processApolloRequest(fCtx.event, fCtx.context, apolloServer, options);
      return false;
    } else {
      // Not handled by apollo
      return true;
    }
  }

  public static async processApolloRequest<T>(
    event: APIGatewayEvent,
    context: Context,
    apolloServer: ApolloServer<T>,
    options?: EpsilonLambdaApolloOptions<T>
  ): Promise<ProxyResult> {
    Logger.silly('Processing event with apollo: %j', event);
    let rval: ProxyResult = null;
    RequireRatchet.notNullOrUndefined(apolloServer, 'apolloServer');
    apolloServer.assertStarted('Cannot process with apollo - instance not started');

    const headerMap: HeaderMap = new HeaderMap();
    for (const headersKey in event.headers) {
      headerMap.set(headersKey, event.headers[headersKey]);
    }
    const eventMethod: string = StringRatchet.trimToEmpty(event.httpMethod).toUpperCase();
    let body: any = null;
    if (StringRatchet.trimToNull(event.body)) {
      const bodyString: string = event.isBase64Encoded ? Base64Ratchet.base64StringToString(event.body) : event.body;
      body = JSON.parse(bodyString);
    }

    const aRequest: HTTPGraphQLRequest = {
      method: eventMethod,
      headers: headerMap,
      search: eventMethod === 'GET' ? 'IMPLEMENT-ME' : null,
      body: body,
    };

    // We do this because fully timing out on Lambda is never a good thing
    const timeoutMS: number = options?.timeoutMS ?? context.getRemainingTimeInMillis() - 500;

    //const defaultContextFn: ContextFunction<[EpsilonLambdaApolloContextFunctionArgument], any> = async () => ({});

    const contextFn: ContextFunction<[EpsilonLambdaApolloContextFunctionArgument], T> = options?.context ?? ApolloUtil.emptyContext;

    const apolloPromise = apolloServer.executeHTTPGraphQLRequest({
      httpGraphQLRequest: aRequest,
      context: () => contextFn({ lambdaContext: context, lambdaEvent: event }),
    });

    let result: HTTPGraphQLResponse | TimeoutToken = null;
    if (timeoutMS) {
      result = await PromiseRatchet.timeout(apolloPromise, 'Apollo timed out after ' + timeoutMS + ' ms.', timeoutMS);
    } else {
      Logger.warn('No timeout set even after defaulting for Apollo');
      result = await apolloPromise;
    }

    if (TimeoutToken.isTimeoutToken(result)) {
      (result as TimeoutToken).writeToLog();
      throw new RequestTimeoutError('Timed out');
    }

    // If we reach here we didn't time out
    const httpGraphQLResponse: HTTPGraphQLResponse = result as HTTPGraphQLResponse; // TODO: Use typeguard here instead

    const outHeaders: Record<string, string> = {};
    for (const headersKey in httpGraphQLResponse.headers) {
      outHeaders[headersKey] = httpGraphQLResponse.headers[headersKey];
    }

    if (httpGraphQLResponse.body.kind === 'chunked') {
      // This is legal according to https://www.apollographql.com/docs/apollo-server/integrations/building-integrations/
      throw new EpsilonHttpError('Apollo returned chunked result').withHttpStatusCode(500).withRequestId(ContextUtil.currentRequestId());
    }

    rval = {
      body: Base64Ratchet.generateBase64VersionOfString(httpGraphQLResponse.body.string),
      headers: outHeaders,
      multiValueHeaders: {}, // TODO: Need setting?
      isBase64Encoded: true,
      statusCode: httpGraphQLResponse.status || 200,
    };

    // Finally, a double check to set the content type correctly if the browser page was shown
    if (StringRatchet.trimToEmpty(rval?.body).startsWith('<!DOCTYPE html>')) {
      Logger.info('Forcing content type to html');
      rval.headers = rval.headers || {};
      rval.headers['content-type'] = 'text/html';
    }
    return rval;
  }

  public static addApolloFilterToList(
    filters: FilterFunction[],
    apolloPathRegex: RegExp,
    apolloServer: ApolloServer,
    options?: EpsilonLambdaApolloOptions<BaseContext>
  ): void {
    if (filters) {
      filters.push((fCtx) => ApolloFilter.handlePathWithApollo(fCtx, apolloPathRegex, apolloServer, options));
    }
  }
}

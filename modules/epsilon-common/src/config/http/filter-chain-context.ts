import { Context, ProxyResult } from 'aws-lambda';
import { ExtendedAPIGatewayEvent } from './extended-api-gateway-event.js';
import { ModelValidator } from '@bitblit/ratchet-misc/model-validator/model-validator';
import { AuthorizerFunction } from './authorizer-function.js';
import { RouteAndParse } from '../../http/route/route-and-parse';

export interface FilterChainContext {
  event: ExtendedAPIGatewayEvent;
  context: Context;
  rawResult: any; // Result before coercion to a proxyResult
  result: ProxyResult;
  routeAndParse: RouteAndParse;
  modelValidator: ModelValidator;
  authenticators: Map<string, AuthorizerFunction>;
}

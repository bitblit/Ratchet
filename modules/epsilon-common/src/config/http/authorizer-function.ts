import { RouteMapping } from '../../http/route/route-mapping.js';
import { EpsilonAuthorizationContext } from './epsilon-authorization-context.js';
import { ExtendedAPIGatewayEvent } from './extended-api-gateway-event.js';

export type AuthorizerFunction = (authData: EpsilonAuthorizationContext<any>, event?: ExtendedAPIGatewayEvent, route?: RouteMapping) => Promise<boolean>;

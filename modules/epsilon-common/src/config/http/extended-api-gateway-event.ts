import { APIGatewayEvent } from 'aws-lambda';
import { EpsilonAuthorizationContext } from './epsilon-authorization-context.js';

export interface ExtendedAPIGatewayEvent extends APIGatewayEvent {
  parsedBody: any;
  authorization: EpsilonAuthorizationContext<any>;
  convertedFromV2Event: boolean;
}

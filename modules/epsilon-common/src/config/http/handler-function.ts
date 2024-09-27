import { Context } from 'aws-lambda';
import { ExtendedAPIGatewayEvent } from './extended-api-gateway-event.js';

export type HandlerFunction<T> = (event: ExtendedAPIGatewayEvent, context?: Context) => Promise<T>;

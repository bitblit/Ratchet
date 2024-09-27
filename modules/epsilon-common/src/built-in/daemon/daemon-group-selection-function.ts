import { ExtendedAPIGatewayEvent } from '../../config/http/extended-api-gateway-event.js';

export type DaemonGroupSelectionFunction = (evt: ExtendedAPIGatewayEvent) => Promise<string>;

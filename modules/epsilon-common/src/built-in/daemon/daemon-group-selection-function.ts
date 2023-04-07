import { ExtendedAPIGatewayEvent } from '../../config/http/extended-api-gateway-event.js';

export interface DaemonGroupSelectionFunction {
  (evt: ExtendedAPIGatewayEvent): Promise<string>;
}

import { DaemonProcessState } from '@bitblit/ratchet-aws/lib/daemon/daemon-process-state.js';
import { ExtendedAPIGatewayEvent } from '../../config/http/extended-api-gateway-event.js';

export interface DaemonAuthorizerFunction {
  (evt: ExtendedAPIGatewayEvent, proc: DaemonProcessState): Promise<boolean>;
}

import { DaemonProcessState } from "@bitblit/ratchet-aws/daemon/daemon-process-state";
import { ExtendedAPIGatewayEvent } from "../../config/http/extended-api-gateway-event.js";

export type DaemonAuthorizerFunction = (evt: ExtendedAPIGatewayEvent, proc: DaemonProcessState) => Promise<boolean>;

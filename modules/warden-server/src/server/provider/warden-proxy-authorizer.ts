import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";

/**
 * Classes implementing WardenProxyAuthorizer decide whether
 * a given proxy request is allowed
 */

export interface WardenProxyAuthorizer {
  mayProxyLogin(source: WardenEntry, target: WardenEntry): Promise<boolean>;
}

import { WardenLoginThirdPartyToken } from "@bitblit/ratchet-warden-common/common/model/warden-login-third-party-token";
import {
  WardenThirdPartyAuthentication
} from "@bitblit/ratchet-warden-common/common/model/warden-third-party-authentication";

/**
 * Classes implementing WardenThirdPartyAuthenticator are able to
 * validate tokens from a third party and if they are valid, return
 * the user id in that system.  Warden can then lookup the local user
 * by that user id
 *
 */

export interface WardenThirdPartyAuthenticationProvider {
  handlesThirdParty(thirdParty: string): boolean;
  validateTokenAndReturnThirdPartyUserId(input: WardenLoginThirdPartyToken, origin: string): Promise<WardenThirdPartyAuthentication>;
}

import { WardenWebAuthnEntry } from "./warden-web-authn-entry.js";
import { WardenThirdPartyAuthentication } from "./warden-third-party-authentication.js";
import { WardenEntryCommonData } from "./warden-entry-common-data.ts";

export interface WardenEntry extends WardenEntryCommonData{
  webAuthnAuthenticators: WardenWebAuthnEntry[];
  thirdPartyAuthenticators: WardenThirdPartyAuthentication[];

  userTokenExpirationSeconds: number;

  createdEpochMS: number;
  updatedEpochMS: number;
}

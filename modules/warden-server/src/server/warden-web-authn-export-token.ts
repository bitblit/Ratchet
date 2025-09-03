import { WardenWebAuthnEntry } from "@bitblit/ratchet-warden-common/common/model/warden-web-authn-entry";

export interface WardenWebAuthnExportToken {
  entry: WardenWebAuthnEntry;
  challenge: string;
}
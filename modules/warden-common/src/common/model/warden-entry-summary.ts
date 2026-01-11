import { WardenWebAuthnEntrySummary } from "./warden-web-authn-entry-summary.js";
import { WardenEntryCommonData } from "./warden-entry-common-data.ts";

export interface WardenEntrySummary extends WardenEntryCommonData {
  webAuthnAuthenticatorSummaries: WardenWebAuthnEntrySummary[];
}

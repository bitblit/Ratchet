import { WardenContact } from './warden-contact.js';
import { WardenWebAuthnEntrySummary } from './warden-web-authn-entry-summary.js';

export interface WardenEntrySummary {
  userId: string;
  userLabel: string; // Usually full name, could be something else
  contactMethods: WardenContact[];
  webAuthnAuthenticatorSummaries: WardenWebAuthnEntrySummary[];
}

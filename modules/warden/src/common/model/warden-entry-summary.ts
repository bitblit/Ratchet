import { WardenContact } from './warden-contact';

export interface WardenEntrySummary {
  userId: string;
  userLabel: string; // Usually full name, could be something else
  contactMethods: WardenContact[];
  webAuthnAuthenticatorIds: string[];
}

import { WardenWebAuthnEntry } from './warden-web-authn-entry';
import { WardenContactEntry } from './warden-contact-entry';

export interface WardenEntry {
  userId: string;
  userLabel: string; // Usually full name, could be something else
  contactMethods: WardenContactEntry[];
  tags: string[];
  webAuthnAuthenticators: WardenWebAuthnEntry[];
  createdEpochMS: number;
  updatedEpochMS: number;
}

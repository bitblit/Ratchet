import { WardenWebAuthnEntry } from './warden-web-authn-entry.js';
import { WardenContact } from './warden-contact.js';
import { WardenThirdPartyAuthentication } from "./warden-third-party-authentication.js";

export interface WardenEntry {
  userId: string;
  userLabel: string; // Usually full name, could be something else
  contactMethods: WardenContact[];
  tags: string[];
  webAuthnAuthenticators: WardenWebAuthnEntry[];
  thirdPartyAuthenticators: WardenThirdPartyAuthentication[];
  createdEpochMS: number;
  updatedEpochMS: number;
}

import { SimpleAuthenticationWebAuthnEntry } from './simple-authentication-web-authn-entry';
import { SimpleAuthenticationContactEntry } from './simple-authentication-contact-entry';

export interface SimpleAuthenticationEntry {
  userId: string;
  userLabel: string; // Usually full name, could be something else
  contactMethods: SimpleAuthenticationContactEntry[];
  tags: string[];
  webAuthnAuthenticators: SimpleAuthenticationWebAuthnEntry[];
  createdEpochMS: number;
  updatedEpochMS: number;
}

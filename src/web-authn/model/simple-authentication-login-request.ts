import { SimpleAuthenticationContactEntry } from './simple-authentication-contact-entry';
import { SimpleAuthenticationWebAuthnWrappedInput } from './simple-authentication-web-authn-wrapped-input';

export interface SimpleAuthenticationLoginRequest {
  contact: SimpleAuthenticationContactEntry;
  webAuthn: SimpleAuthenticationWebAuthnWrappedInput;
  expiringToken: string;
}

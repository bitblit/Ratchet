import { WardenContactEntry } from './warden-contact-entry';
import { WardenWebAuthnWrappedInput } from './warden-web-authn-wrapped-input';

export interface WardenLoginRequest {
  contact: WardenContactEntry;
  webAuthn: WardenWebAuthnWrappedInput;
  expiringToken: string;
}

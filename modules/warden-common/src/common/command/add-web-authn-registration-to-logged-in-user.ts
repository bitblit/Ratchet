import { WebAuthnObjectWrapper } from './web-authn-object-wrapper.js';

export interface AddWebAuthnRegistrationToLoggedInUser {
  webAuthn: WebAuthnObjectWrapper;
  applicationName: string;
  deviceLabel: string;
}

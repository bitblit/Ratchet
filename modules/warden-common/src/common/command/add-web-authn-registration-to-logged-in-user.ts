import { WebAuthnObjectWrapper } from './web-authn-object-wrapper';

export interface AddWebAuthnRegistrationToLoggedInUser {
  webAuthn: WebAuthnObjectWrapper;
  applicationName: string;
  deviceLabel: string;
}

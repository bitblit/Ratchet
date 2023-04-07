import { CreateAccount } from './create-account.js';
import { WardenContact } from '../model/warden-contact.js';
import { WebAuthnObjectWrapper } from './web-authn-object-wrapper.js';
import { RemoveWebAuthnRegistration } from './remove-web-authn-registration.js';
import { WardenLoginRequest } from '../model/warden-login-request.js';

export interface WardenCommand {
  createAccount?: CreateAccount;
  generateWebAuthnAuthenticationChallengeForUserId?: string;
  generateWebAuthnRegistrationChallengeForLoggedInUser?: boolean;
  sendExpiringValidationToken?: WardenContact;
  addWebAuthnRegistrationToLoggedInUser?: WebAuthnObjectWrapper;
  addContactToLoggedInUser?: WardenContact;

  removeWebAuthnRegistrationFromLoggedInUser?: string;
  removeContactFromLoggedInUser?: WardenContact;

  removeWebAuthnRegistration?: RemoveWebAuthnRegistration;

  performLogin?: WardenLoginRequest;
  refreshJwtToken?: string;
}

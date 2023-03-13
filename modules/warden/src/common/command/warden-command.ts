import { CreateAccount } from './create-account';
import { WardenContact } from '../model/warden-contact';
import { WebAuthnObjectWrapper } from './web-authn-object-wrapper';
import { RemoveWebAuthnRegistration } from './remove-web-authn-registration';
import { WardenLoginRequest } from '../model/warden-login-request';

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

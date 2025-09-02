import { CreateAccount } from './create-account.js';
import { WardenContact } from '../model/warden-contact.js';
import { RemoveWebAuthnRegistration } from './remove-web-authn-registration.js';
import { WardenLoginRequest } from '../model/warden-login-request.js';
import { SendMagicLink } from './send-magic-link.js';
import { AddWebAuthnRegistrationToLoggedInUser } from './add-web-authn-registration-to-logged-in-user.js';

export interface WardenCommand {
  createAccount?: CreateAccount;
  sendMagicLink?: SendMagicLink;
  generateWebAuthnAuthenticationChallengeForUserId?: string;
  generateWebAuthnRegistrationChallengeForLoggedInUser?: boolean;
  sendExpiringValidationToken?: WardenContact;
  addWebAuthnRegistrationToLoggedInUser?: AddWebAuthnRegistrationToLoggedInUser;
  addContactToLoggedInUser?: WardenContact;

  removeWebAuthnRegistrationFromLoggedInUser?: string;
  removeContactFromLoggedInUser?: WardenContact;

  removeWebAuthnRegistration?: RemoveWebAuthnRegistration;

  performLogin?: WardenLoginRequest;
  refreshJwtToken?: string;

  exportWebAuthnRegistrationEntryForLoggedInUser?: string; // Pass the target origin
  importWebAuthnRegistrationEntryForLoggedInUser?: string;


}

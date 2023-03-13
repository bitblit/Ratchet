import { WebAuthnObjectWrapper } from './web-authn-object-wrapper';
import { WardenLoginResults } from '../model/warden-login-results';
import { WardenEntrySummary } from '../model/warden-entry-summary';
import { WardenContact } from '../model/warden-contact';

export interface WardenCommandResponse {
  createAccount?: string;
  generateWebAuthnAuthenticationChallengeForUserId?: WebAuthnObjectWrapper;
  generateWebAuthnRegistrationChallengeForLoggedInUser?: WebAuthnObjectWrapper;
  removeWebAuthnRegistration?: WardenEntrySummary;
  sendExpiringValidationToken?: boolean;
  addWebAuthnRegistrationToLoggedInUser?: WardenEntrySummary;
  addContactToLoggedInUser?: boolean;
  performLogin?: WardenLoginResults;
  refreshJwtToken?: string;

  removeWebAuthnRegistrationFromLoggedInUser?: WardenEntrySummary;
  removeContactFromLoggedInUser?: WardenEntrySummary;

  error?: string;
}

import { WebAuthnObjectWrapper } from './web-authn-object-wrapper.js';
import { WardenLoginResults } from '../model/warden-login-results.js';
import { WardenEntrySummary } from '../model/warden-entry-summary.js';

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

import { WardenContact } from './warden-contact.js';
import { AuthenticationResponseJSON } from '@simplewebauthn/types';

export interface WardenLoginRequest {
  userId?: string;
  contact?: WardenContact;
  webAuthn?: AuthenticationResponseJSON;
  expiringToken?: string;
  jwtTokenToRefresh?: string;
  createUserIfMissing?: boolean;
}

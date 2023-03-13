import { WardenContact } from './warden-contact';
import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';

export interface WardenLoginRequest {
  userId?: string;
  contact?: WardenContact;
  webAuthn?: AuthenticationResponseJSON;
  expiringToken?: string;
  jwtTokenToRefresh?: string;
}

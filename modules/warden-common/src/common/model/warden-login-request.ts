import { WardenContact } from './warden-contact.js';
import { AuthenticationResponseJSON } from '@simplewebauthn/browser';
import { WardenLoginRequestType } from "./warden-login-request-type.js";
import { WardenLoginThirdPartyToken } from "./warden-login-third-party-token";

export interface WardenLoginRequest {
  type: WardenLoginRequestType;
  userId?: string;
  contact?: WardenContact;
  webAuthn?: AuthenticationResponseJSON;
  thirdPartyToken?: WardenLoginThirdPartyToken;
  expiringToken?: string;
  jwtTokenToRefresh?: string;
  createUserIfMissing?: boolean;
}

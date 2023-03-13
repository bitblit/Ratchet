import { WardenLoginRequest } from './warden-login-request';

export interface WardenLoginResults {
  request: WardenLoginRequest;
  userId?: string;
  jwtToken?: string;
  error?: string;
}

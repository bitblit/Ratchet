import { WardenLoginRequest } from './warden-login-request.js';

export interface WardenLoginResults {
  request: WardenLoginRequest;
  userId?: string;
  jwtToken?: string;
  error?: string;
}

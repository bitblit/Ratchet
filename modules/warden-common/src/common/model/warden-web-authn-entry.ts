import { WardenWebAuthnTransportFutureType } from './warden-web-authn-transport-future-type.js';

export interface WardenWebAuthnEntry {
  credentialIdBase64: string;
  credentialPublicKeyBase64: string;
  counter: number;
  credentialBackedUp: boolean;
  credentialDeviceType: string;
  transports?: WardenWebAuthnTransportFutureType[];
}

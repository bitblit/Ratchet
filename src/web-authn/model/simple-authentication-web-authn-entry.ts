export interface SimpleAuthenticationWebAuthnEntry {
  credentialIdBase64: string;
  credentialPublicKeyBase64: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: WebAuthnTransportFutureType[];
}

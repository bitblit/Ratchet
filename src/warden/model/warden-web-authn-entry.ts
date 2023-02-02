export interface WardenWebAuthnEntry {
  credentialIdBase64: string;
  credentialPublicKeyBase64: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: WardenWebAuthnTransportFutureType[];
}

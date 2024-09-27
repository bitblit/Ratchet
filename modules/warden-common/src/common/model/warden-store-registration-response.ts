import { WardenStoreRegistrationResponseType } from './warden-store-registration-response-type.js';
import { WardenEntry } from './warden-entry.js';

export interface WardenStoreRegistrationResponse {
  updatedEntry?: WardenEntry;
  registrationResponseId: string;
  result: WardenStoreRegistrationResponseType;
  error?: string;
}

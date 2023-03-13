import { WardenStoreRegistrationResponseType } from './warden-store-registration-response-type';
import { WardenEntry } from './warden-entry';

export interface WardenStoreRegistrationResponse {
  updatedEntry?: WardenEntry;
  registrationResponseId: string;
  result: WardenStoreRegistrationResponseType;
  error?: string;
}

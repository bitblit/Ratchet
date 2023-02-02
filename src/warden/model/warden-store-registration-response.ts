import { WardenStoreRegistrationResponseType } from './warden-store-registration-response-type';

export interface WardenStoreRegistrationResponse {
  id: string;
  result: WardenStoreRegistrationResponseType;
  notes?: string;
}

import { WardenContact } from '../model/warden-contact.js';

export interface CreateAccount {
  contact: WardenContact;
  sendCode?: boolean;
  label?: string;
}

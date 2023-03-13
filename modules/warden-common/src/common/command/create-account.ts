import { WardenContact } from '../model/warden-contact';

export interface CreateAccount {
  contact: WardenContact;
  sendCode?: boolean;
  label?: string;
  tags?: string[];
}

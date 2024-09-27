import { WardenContact } from '../model/warden-contact.js';
import { WardenContactType } from '../model/warden-contact-type.js';

// Used when you want to look up a particular contact by userId/contact type on the server side
export interface WardenContactLookup {
  userId?: string;
  contactType?: WardenContactType;
}

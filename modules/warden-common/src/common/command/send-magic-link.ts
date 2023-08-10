import { WardenContact } from '../model/warden-contact.js';
import { WardenContactType } from '../model/warden-contact-type.js';

// You must set either contact or userId/contactType, but not both
export interface SendMagicLink {
  userId?: string;
  contactType?: WardenContactType;
  contact?: WardenContact;
  landingUrl: string;
  meta?: Record<string, string>;
}

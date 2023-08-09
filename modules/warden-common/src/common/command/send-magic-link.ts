import { WardenContact } from '../model/warden-contact.js';

export interface SendMagicLink {
  contact: WardenContact;
  landingUrl: string;
  meta?: Record<string, string>;
}

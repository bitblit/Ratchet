import { WardenContact } from '../model/warden-contact.js';
import { WardenContactLookup } from './warden-contact-lookup.js';
import { WardenCustomTemplateDescriptor } from './warden-custom-template-descriptor';

// You must set either contact or contactLookup, but not both
export interface SendMagicLink {
  overrideDestinationContact?: WardenContact; // If this is set, then the link will be a login for the userId/contact below, but sent to this address

  contactLookup?: WardenContactLookup;
  contact?: WardenContact;
  landingUrl: string;
  meta?: Record<string, string>;
  ttlSeconds?: number;
  customTemplate?: WardenCustomTemplateDescriptor;
}

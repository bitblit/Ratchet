import { WardenContact } from '../model/warden-contact.js';
import { KeyValue } from '@bitblit/ratchet-common';

export interface SendMagicLink {
  contact: WardenContact;
  landingUrl: string;
  templateName?: string;
  meta?: KeyValue[];
}

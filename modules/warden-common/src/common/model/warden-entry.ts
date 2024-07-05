import { WardenWebAuthnEntry } from "./warden-web-authn-entry.js";
import { WardenContact } from "./warden-contact.js";

export interface WardenEntry {
  userId: string;
  userLabel: string; // Usually full name, could be something else
  contactMethods: WardenContact[];
  tags: string[];
  webAuthnAuthenticators: WardenWebAuthnEntry[];
  createdEpochMS: number;
  updatedEpochMS: number;
}

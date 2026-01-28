import { WardenContact } from "./warden-contact.js";

export interface WardenProxyUserRequest {
  targetUserId?: string;
  targetContact?: WardenContact;
}

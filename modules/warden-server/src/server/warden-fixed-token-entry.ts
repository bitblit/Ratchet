import { WardenContact } from "@bitblit/ratchet-warden-common/common/model/warden-contact";

export interface WardenFixedTokenEntry {
  contact: WardenContact;
  token: string;
}
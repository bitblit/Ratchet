import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { WardenContact } from "@bitblit/ratchet-warden-common/common/model/warden-contact";
import {
  WardenThirdPartyAuthentication
} from "@bitblit/ratchet-warden-common/common/model/warden-third-party-authentication";

export class WardenEntryBuilder {

  private readonly _entry: WardenEntry;

  constructor(label?: string ) {
    const guid: string = StringRatchet.createShortUid();
    const now: number = Date.now();
    this._entry = {
      userId: guid,
      userLabel: label || 'User '+guid,
      contactMethods: [],
      tags: [],
      webAuthnAuthenticators: [],
      thirdPartyAuthenticators: [],
      createdEpochMS: now,
      updatedEpochMS: now,
    };
  }

  public withTags(tags: string[]): WardenEntryBuilder {
    this._entry.tags = tags ?? [];
    return this;
  }

  public withThirdPartyAuthentication(thirdPartyAuthenticators: [WardenThirdPartyAuthentication]): WardenEntryBuilder {
    this._entry.thirdPartyAuthenticators = thirdPartyAuthenticators ?? [];
    return this;
  }

  public withLabel(label: string): WardenEntryBuilder {
    this._entry.userLabel = label;
    return this;
  }

  public withLabelFromContact(contact: WardenContact): WardenEntryBuilder {
    this._entry.userLabel = contact.value;
    return this;
  }

  public withContacts(contacts: [WardenContact]): WardenEntryBuilder {
    this._entry.contactMethods = contacts ?? [];
    return this;
  }

  public get entry(): WardenEntry {
    return this._entry;
  }

}
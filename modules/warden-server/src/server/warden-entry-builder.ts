import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { WardenContact } from "@bitblit/ratchet-warden-common/common/model/warden-contact";
import {
  WardenThirdPartyAuthentication
} from "@bitblit/ratchet-warden-common/common/model/warden-third-party-authentication";
import { WardenEntryMetadata } from "@bitblit/ratchet-warden-common/common/model/warden-entry-metadata";
import { WardenTeamRoleMapping } from "@bitblit/ratchet-warden-common/common/model/warden-team-role-mapping";

export class WardenEntryBuilder {

  private readonly _entry: WardenEntry;

  constructor(label?: string ) {
    const guid: string = StringRatchet.createShortUid();
    const now: number = Date.now();
    this._entry = {
      userId: guid,
      userLabel: label || 'User '+guid,
      contactMethods: [],
      webAuthnAuthenticators: [],
      thirdPartyAuthenticators: [],

      globalRoleIds: [],
      teamRoleMappings: [],
      meta: [],

      userTokenExpirationSeconds: 3600,
      createdEpochMS: now,
      updatedEpochMS: now,
    };
  }

  public withMeta(value: WardenEntryMetadata[]): WardenEntryBuilder {
    this._entry.meta = value || [];
    return this;
  }

  public withGlobalRoleIds(value: string[]): WardenEntryBuilder {
    this._entry.globalRoleIds = value || [];
    return this;
  }

  public withTeamRoleMappings(value: WardenTeamRoleMapping[]): WardenEntryBuilder {
    this._entry.teamRoleMappings = value || [];
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
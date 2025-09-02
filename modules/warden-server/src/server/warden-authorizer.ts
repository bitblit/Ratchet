import { WardenServiceOptions } from "./warden-service-options.js";
import { WardenContact } from "@bitblit/ratchet-warden-common/common/model/warden-contact";
import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { WardenUtils } from "@bitblit/ratchet-warden-common/common/util/warden-utils";
import { WardenUserDecoration } from "@bitblit/ratchet-warden-common/common/model/warden-user-decoration";

export class WardenAuthorizer {

  constructor(private opts: WardenServiceOptions) {
  }

  // Passthru for very common use case
  public findEntryByContact(contact: WardenContact): Promise<WardenEntry> {
    return this.opts.storageProvider.findEntryByContact(contact);
  }

  // Passthru for very common use case
  public findEntryById(userId: string): Promise<WardenEntry> {
    return this.opts.storageProvider.findEntryById(userId);
  }

  public async findDecoratorBy(userId: string): Promise<WardenUserDecoration<any>> {
    const user: WardenEntry = await this.findEntryById(userId);
    const rval: WardenUserDecoration<any> = user ? await this.opts.userDecorationProvider.fetchDecoration(user) : null;
    return rval;
  }

  public async userHasGlobalRole(userId: string, roleId: string): Promise<boolean> {
    let rval: boolean = false;
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    rval = user ? WardenUtils.userHasGlobalRole(user, roleId) : false;
    return rval;
  }

  public async userHasRoleOnTeam(userId: string, roleId: string, teamId: string): Promise<boolean> {
    let rval: boolean = false;
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    rval = user ? WardenUtils.userHasRoleOnTeam(user, roleId, teamId) : false;
    return rval;
  }



}

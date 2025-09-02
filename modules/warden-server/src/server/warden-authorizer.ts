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
    return this.userHasGlobalRoles(userId, [roleId], true);
  }

  public async userHasRoleOnTeam(userId: string,teamId: string, roleId: string): Promise<boolean> {
    return this.userHasRolesOnTeam(userId, teamId, [roleId], true);
  }

  public async userHasAtLeastOneGlobalRole(userId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasGlobalRoles(userId, roleIds, false);
  }

  public async userHasAtLeastOneRoleOnTeam(userId: string, teamId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasRolesOnTeam(userId, teamId, roleIds, false);
  }


  public async userHasAllGlobalRoles(userId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasGlobalRoles(userId, roleIds, true);
  }

  public async userHasAllRolesOnTeam(userId: string, teamId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasRolesOnTeam(userId, teamId, roleIds, true);
  }


  public async userHasGlobalRoles(userId: string, roleIds: string[], combineWithAnd: boolean): Promise<boolean> {
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    return WardenUtils.userHasGlobalRoles(user, roleIds, combineWithAnd);
  }

  public async userHasRolesOnTeam(userId: string, teamId: string, roleIds: string[], combineWithAnd: boolean): Promise<boolean> {
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    return WardenUtils.userHasRolesOnTeam(user, teamId, roleIds, combineWithAnd);
  }

}

import { WardenServiceOptions } from "./warden-service-options.js";
import { WardenContact } from "@bitblit/ratchet-warden-common/common/model/warden-contact";
import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { WardenUtils } from "@bitblit/ratchet-warden-common/common/util/warden-utils";
import { WardenUserDecoration } from "@bitblit/ratchet-warden-common/common/model/warden-user-decoration";
import { BooleanRatchet } from "@bitblit/ratchet-common/lang/boolean-ratchet";

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
    const rval: boolean = await this.userHasGlobalRoles(userId, [roleId], true);
    return rval;
  }

  public async userHasRoleOnTeam(userId: string,teamId: string, roleId: string): Promise<boolean> {
    const rval: boolean = await this.userHasRolesOnTeam(userId, teamId, [roleId], true);
    return rval;
  }

  public async userHasAtLeastOneGlobalRole(userId: string, roleIds: string[]): Promise<boolean> {
    const rval: boolean = await this.userHasGlobalRoles(userId, roleIds, false);
    return rval;
  }

  public async userHasAtLeastOneRoleOnTeam(userId: string, teamId: string, roleIds: string[]): Promise<boolean> {
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    const rval = user ? await this.userHasRolesOnTeam(user, teamId, roleIds, false) : false;
    return rval;
  }


  public async userHasAllGlobalRoles(userId: string, roleIds: string[]): Promise<boolean> {
    const rval: boolean = await this.userHasGlobalRoles(userId, roleIds, true);
    return rval;
  }

  public async userHasAllRolesOnTeam(userId: string, teamId: string, roleIds: string[]): Promise<boolean> {
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    const rval = user ? await this.userHasRolesOnTeam(user, teamId, roleIds, true) : false;
    return rval;
  }


  public async userHasGlobalRoles(userId: string, roleIds: string[], combineWithAnd: boolean): Promise<boolean> {
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    const hasMap: boolean[] = user ? roleIds.map(r=>WardenUtils.userHasGlobalRole(user, r)) : [false];
    const rval: boolean = combineWithAnd ? BooleanRatchet.allTrue(hasMap) : BooleanRatchet.anyTrue(hasMap);
    return rval;
  }

  public async userHasRolesOnTeam(userId: string, teamId: string, roleIds: string[], combineWithAnd: boolean): Promise<boolean> {
    const user: WardenUserDecoration<any> = await this.findDecoratorBy(userId);
    const hasMap: boolean[] = user ? roleIds.map(r=>WardenUtils.userHasRoleOnTeam(user, r, teamId)) : [false];
    const rval: boolean = combineWithAnd ? BooleanRatchet.allTrue(hasMap) : BooleanRatchet.anyTrue(hasMap);
    return rval;
  }

}

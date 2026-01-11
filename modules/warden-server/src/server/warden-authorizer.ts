import { WardenServiceOptions } from "./warden-service-options.js";
import { WardenContact } from "@bitblit/ratchet-warden-common/common/model/warden-contact";
import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { WardenUtils } from "@bitblit/ratchet-warden-common/common/util/warden-utils";
import { WardenEntryCommonData } from "@bitblit/ratchet-warden-common/common/model/warden-entry-common-data";

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

  public async userHasGlobalRoleById(userId: string, roleId: string): Promise<boolean> {
    return this.userHasGlobalRole(await this.findEntryById(userId), roleId);
  }

  public async userHasRoleOnTeamById(userId: string,teamId: string, roleId: string): Promise<boolean> {
    return this.userHasRolesOnTeam(await this.findEntryById(userId), teamId, [roleId], true);
  }

  public async userHasAtLeastOneGlobalRoleById(userId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasGlobalRoles(await this.findEntryById(userId), roleIds, false);
  }

  public async userHasAtLeastOneRoleOnTeamById(userId: string, teamId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasRolesOnTeam(await this.findEntryById(userId), teamId, roleIds, false);
  }


  public async userHasAllGlobalRolesById(userId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasGlobalRoles(await this.findEntryById(userId), roleIds, true);
  }

  public async userHasAllRolesOnTeamById(userId: string, teamId: string, roleIds: string[]): Promise<boolean> {
    return this.userHasRolesOnTeam(await this.findEntryById(userId), teamId, roleIds, true);
  }


  public async userHasGlobalRolesById(userId: string, roleIds: string[], combineWithAnd: boolean): Promise<boolean> {
    return WardenUtils.userHasGlobalRoles(await this.findEntryById(userId), roleIds, combineWithAnd);
  }

  public async userHasRolesOnTeamById(userId: string, teamId: string, roleIds: string[], combineWithAnd: boolean): Promise<boolean> {
    return WardenUtils.userHasRolesOnTeam(await this.findEntryById(userId), teamId, roleIds, combineWithAnd);
  }

  // Just a synonym since that is how some people think
  public async userIsTeamMemberById(userId: string, teamId: string): Promise<boolean> {
    return WardenUtils.userIsTeamMember(await this.findEntryById(userId),teamId);
  }

  public async userHasAnyRoleOnTeamById(userId: string, teamId: string): Promise<boolean> {
    return WardenUtils.userHasAnyRoleOnTeam(await this.findEntryById(userId),teamId);
  }

  public async usersTeamMembershipsById(userId: string): Promise<string[]> {
    return WardenUtils.usersTeamMemberships(await this.findEntryById(userId));
  }


  // Simple passthrus for convenience
  public userHasGlobalRole(user: WardenEntryCommonData, roleId: string): boolean {
    return WardenUtils.userHasGlobalRoles(user, [roleId], true);
  }

  public userHasRoleOnTeam(user: WardenEntryCommonData,teamId: string, roleId: string): boolean {
    return WardenUtils.userHasRolesOnTeam(user, teamId, [roleId], true);
  }

  public userHasAtLeastOneGlobalRole(user: WardenEntryCommonData, roleIds: string[]): boolean {
    return WardenUtils.userHasGlobalRoles(user, roleIds, false);
  }

  public userHasAtLeastOneRoleOnTeam(user: WardenEntryCommonData, teamId: string, roleIds: string[]): boolean {
    return WardenUtils.userHasRolesOnTeam(user, teamId, roleIds, false);
  }


  public userHasAllGlobalRoles(user: WardenEntryCommonData, roleIds: string[]): boolean {
    return WardenUtils.userHasGlobalRoles(user, roleIds, true);
  }

  public userHasAllRolesOnTeam(user: WardenEntryCommonData, teamId: string, roleIds: string[]): boolean {
    return WardenUtils.userHasRolesOnTeam(user, teamId, roleIds, true);
  }


  public userHasGlobalRoles(user: WardenEntryCommonData, roleIds: string[], combineWithAnd: boolean): boolean {
    return WardenUtils.userHasGlobalRoles(user, roleIds, combineWithAnd);
  }

  public userHasRolesOnTeam(user: WardenEntryCommonData, teamId: string, roleIds: string[], combineWithAnd: boolean): boolean {
    return WardenUtils.userHasRolesOnTeam(user, teamId, roleIds, combineWithAnd);
  }

  // Just a synonym since that is how some people think
  public userIsTeamMember(user: WardenEntryCommonData, teamId: string): boolean {
    return WardenUtils.userIsTeamMember(user,teamId);
  }

  public userHasAnyRoleOnTeam(user: WardenEntryCommonData, teamId: string): boolean {
    return WardenUtils.userHasAnyRoleOnTeam(user,teamId);
  }

  public usersTeamMemberships(user: WardenEntryCommonData): string[] {
    return WardenUtils.usersTeamMemberships(user);
  }

}

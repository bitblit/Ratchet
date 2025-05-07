import { WardenContact } from "../model/warden-contact.js";
import { WardenContactType } from "../model/warden-contact-type.js";

import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { WardenEntrySummary } from "../model/warden-entry-summary.js";
import { WardenEntry } from "../model/warden-entry.js";
import { WardenLoginRequest } from "../model/warden-login-request.js";
import { WardenTeamRole } from "../model/warden-team-role.js";
import { WardenWebAuthnEntry } from "../model/warden-web-authn-entry.js";
import { WardenWebAuthnEntrySummary } from "../model/warden-web-authn-entry-summary.js";
import { WardenLoggedInUserWrapper } from "../../client/provider/warden-logged-in-user-wrapper.js";
import { WardenLoginRequestType } from "../model/warden-login-request-type.ts";

export class WardenUtils {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    // Empty
  }

  public static extractContactsOfType(req: WardenEntry | WardenEntrySummary, type: WardenContactType): string[] {
    let rval: string[] = null;
    if (req?.contactMethods) {
      rval = req.contactMethods.filter((s) => s.type === type).map((s) => s.value);
    }
    return rval;
  }

  public static loginRequestErrors(req: WardenLoginRequest): string[] {
    const rval: string[] = [];

    if (req) {
      if (req.type) {
        switch(req.type) {
          case WardenLoginRequestType.ExpiringToken:
            if (!req.userId && !WardenUtils.validContact(req.contact)) {
              rval.push('User ID or contact is required');
            }
            if (!req.expiringToken) {
              rval.push('Expiring token is required');
            }
            break;
          case WardenLoginRequestType.ThirdParty:
            if (req.thirdPartyToken) {
              if (!req.thirdPartyToken.thirdParty) {
                rval.push('Third party is required');
              }
              if (!req.thirdPartyToken.token) {
                rval.push('Third party token is required');
              }
            } else {
              rval.push('Third party auth is required');
            }
            break;
          case WardenLoginRequestType.WebAuthn:
            if (!req.userId && !WardenUtils.validContact(req.contact)) {
              rval.push('User ID or contact is required');
            }
            if (!req.webAuthn) {
              rval.push('Web authn is required');
            }
            break;
          case WardenLoginRequestType.JwtTokenToRefresh:
            if (!req.jwtTokenToRefresh) {
            }
          break;
          default: rval.push('Unknown request type');
        }
      } else {
        rval.push('Request type is null');
      }
    } else {
      rval.push('Request is null');
    }
    return rval;
  }


  public static validLoginRequest(req: WardenLoginRequest): boolean {
    return WardenUtils.loginRequestErrors(req).length === 0;
  }

  public static stringToWardenContact(input: string): WardenContact {
    let rval: WardenContact = null;
    const type: WardenContactType = WardenUtils.stringToContactType(input);
    if (type) {
      rval = {
        type: type,
        value: input,
      };
    } else {
      Logger.error('Failed to convert a string to a contact type', input);
    }
    return rval;
  }

  public static teamRolesToRoles(teamRoles: WardenTeamRole[]): string[] {
    const rval: string[] = teamRoles?.length ? teamRoles.map((t) => WardenUtils.teamRoleToRoleString(t)) : [];
    return rval;
  }

  public static roleStringsToTeamRoles(roles: string[]): WardenTeamRole[] {
    const rval: WardenTeamRole[] = roles?.length ? roles.map((t) => WardenUtils.roleStringToTeamRole(t)) : [];
    return rval;
  }

  public static roleStringToTeamRole(role: string): WardenTeamRole {
    let rval: WardenTeamRole = null;
    if (role && role.indexOf('_/_') >= 0) {
      const sp: string[] = role.split('_/_');
      rval = {
        team: sp[0],
        role: sp[1],
      };
    }
    return rval;
  }

  public static teamRoleToRoleString(tr: WardenTeamRole): string {
    let rval: string = null;
    if (tr?.role && tr?.team) {
      rval = tr.team + '_/_' + tr.role;
    }
    return rval;
  }

  public static stringToContactType(input: string): WardenContactType {
    let rval: WardenContactType = null;
    if (StringRatchet.trimToNull(input)) {
      rval = WardenUtils.stringIsEmailAddress(input) ? WardenContactType.EmailAddress : null;
      rval = !rval && WardenUtils.stringIsPhoneNumber(input) ? WardenContactType.TextCapablePhoneNumber : rval;
    }
    return rval;
  }

  public static validContact(contact: WardenContact): boolean {
    let rval: boolean = false;
    if (contact?.type && StringRatchet.trimToNull(contact?.value)) {
      switch (contact.type) {
        case WardenContactType.EmailAddress:
          rval = WardenUtils.stringIsEmailAddress(contact.value);
          break;
        case WardenContactType.TextCapablePhoneNumber:
          rval = WardenUtils.stringIsPhoneNumber(contact.value);
          break;
        default:
          rval = false;
      }
    }

    return rval;
  }

  public static stringIsEmailAddress(value: string): boolean {
    return !!value.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
  }

  public static stringIsPhoneNumber(value: string): boolean {
    return !!value.match(/^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$/im);
  }

  public static stripWardenEntryToSummary(we: WardenEntry): WardenEntrySummary {
    const rval: WardenEntrySummary = we
      ? {
          userId: we.userId,
          userLabel: we.userLabel,
          contactMethods: we.contactMethods,
          webAuthnAuthenticatorSummaries: (we?.webAuthnAuthenticators || []).map((s) => WardenUtils.stripWardenWebAuthnEntryToSummary(s)),
        }
      : null;
    return rval;
  }

  public static stripWardenWebAuthnEntryToSummary(we: WardenWebAuthnEntry): WardenWebAuthnEntrySummary {
    const rval: WardenWebAuthnEntrySummary = we
      ? {
          origin: we.origin,
          applicationName: we.applicationName,
          deviceLabel: we.deviceLabel,
          credentialIdBase64: we.credentialIdBase64,
        }
      : null;
    return rval;
  }

  public static wrapperIsExpired(value: WardenLoggedInUserWrapper<any>): boolean {
    const rval: boolean = value?.userObject?.exp && value.expirationEpochSeconds < Date.now() / 1000;
    return rval;
  }
}

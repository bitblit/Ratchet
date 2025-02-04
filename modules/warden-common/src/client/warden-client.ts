//    Service for interacting with positions for a given user
import { WardenCommand } from '../common/command/warden-command.js';
import { WardenContact } from '../common/model/warden-contact.js';
import { WardenCommandExchangeProvider } from './provider/warden-command-exchange-provider.js';
import { WardenCommandResponse } from '../common/command/warden-command-response.js';

import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';
import { PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON, StartRegistrationOpts } from '@simplewebauthn/browser';
import { WardenLoginResults } from '../common/model/warden-login-results.js';
import { WardenLoginRequest } from '../common/model/warden-login-request.js';
import { WardenClientCurrentLoggedInJwtTokenProvider } from './provider/warden-client-current-logged-in-jwt-token-provider.js';
import { WardenEntrySummary } from '../common/model/warden-entry-summary.js';
import { WardenContactType } from '../common/model/warden-contact-type.js';
import { AddWebAuthnRegistrationToLoggedInUser } from '../common/command/add-web-authn-registration-to-logged-in-user.js';
import { SendMagicLink } from '../common/command/send-magic-link.js';

export class WardenClient {
  constructor(
    private commandSender: WardenCommandExchangeProvider,
    private jwtProvider: WardenClientCurrentLoggedInJwtTokenProvider,
  ) {
    RequireRatchet.notNullOrUndefined(commandSender, 'commandSender');
    RequireRatchet.notNullOrUndefined(jwtProvider, 'jwtProvider');
  }

  public async exchangeCommand(cmd: WardenCommand, returnErrors?: boolean): Promise<WardenCommandResponse> {
    const asString: string = JSON.stringify(cmd);
    const resp: string = await this.commandSender.sendCommand(asString, this.jwtProvider.fetchCurrentLoggedInJwtToken());
    const parsed: WardenCommandResponse = JSON.parse(resp);

    if (parsed?.error && !returnErrors) {
      ErrorRatchet.throwFormattedErr('%s', parsed.error);
    }
    return parsed;
  }

  public async createAccount(contact: WardenContact, sendCode?: boolean, label?: string, tags?: string[]): Promise<string> {
    const cmd: WardenCommand = {
      createAccount: {
        contact: contact,
        sendCode: sendCode,
        label: label,
        tags: tags,
      },
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);

    return rval.createAccount;
  }

  public async sendMagicLinkRaw(smlCmd: SendMagicLink): Promise<boolean> {
    if (smlCmd) {
      const cmd: WardenCommand = {
        sendMagicLink: smlCmd,
      };
      const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
      return rval.sendMagicLink;
    } else {
      Logger.warn('Skipping magic link command - none supplied');
      return false;
    }
  }

  public async sendMagicLinkByUserId(
    userId: string,
    landingUrl: string,
    contactType?: WardenContactType,
    meta?: Record<string, string>,
  ): Promise<boolean> {
    const cmd: SendMagicLink = {
      contactLookup: {
        userId: userId,
        contactType: contactType,
      },
      landingUrl: landingUrl,
      meta: meta,
    };
    return this.sendMagicLinkRaw(cmd);
  }

  public async sendMagicLink(contact: WardenContact, landingUrl: string, meta?: Record<string, string>): Promise<boolean> {
    const cmd: SendMagicLink = {
      contact: contact,
      landingUrl: landingUrl,
      meta: meta,
    };
    return this.sendMagicLinkRaw(cmd);
  }

  public async generateWebAuthnAuthenticationChallengeForUserId(userId: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const cmd: WardenCommand = {
      generateWebAuthnAuthenticationChallengeForUserId: userId,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    const parsed: PublicKeyCredentialRequestOptionsJSON = JSON.parse(rval.generateWebAuthnAuthenticationChallengeForUserId.dataAsJson);
    return parsed;
  }

  public async generateWebAuthnRegistrationChallengeForLoggedInUser(): Promise<StartRegistrationOpts> {
    const cmd: WardenCommand = {
      generateWebAuthnRegistrationChallengeForLoggedInUser: true,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    //Logger.info('generateWebAuthnRegistrationChallengeForLoggedInUser: %j', rval);
    const parsed: StartRegistrationOpts = JSON.parse(rval.generateWebAuthnRegistrationChallengeForLoggedInUser.dataAsJson);
    return parsed;
  }

  public async removeWebAuthnRegistration(userId: string, credId: string): Promise<WardenEntrySummary> {
    const cmd: WardenCommand = {
      removeWebAuthnRegistration: {
        userId: userId,
        credentialId: credId,
      },
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    return rval.removeWebAuthnRegistration;
  }

  public async removeWebAuthnRegistrationFromLoggedInUser(input: string): Promise<WardenEntrySummary> {
    const cmd: WardenCommand = {
      removeWebAuthnRegistrationFromLoggedInUser: input,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    return rval.removeWebAuthnRegistrationFromLoggedInUser;
  }

  public async removeContactFromLoggedInUser(input: WardenContact): Promise<WardenEntrySummary> {
    const cmd: WardenCommand = {
      removeContactFromLoggedInUser: input,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    return rval.removeContactFromLoggedInUser;
  }

  public async sendExpiringValidationToken(contact: WardenContact): Promise<boolean> {
    const cmd: WardenCommand = {
      sendExpiringValidationToken: contact,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    return rval.sendExpiringValidationToken;
  }

  public async addContactToLoggedInUser(contact: WardenContact): Promise<boolean> {
    const cmd: WardenCommand = {
      addContactToLoggedInUser: contact,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    return rval.addContactToLoggedInUser;
  }

  public async addWebAuthnRegistrationToLoggedInUser(
    applicationName: string,
    deviceLabel: string,
    data: RegistrationResponseJSON,
  ): Promise<WardenEntrySummary> {
    const inCmd: AddWebAuthnRegistrationToLoggedInUser = {
      webAuthn: {
        dataAsJson: JSON.stringify(data),
      },
      applicationName: applicationName,
      deviceLabel: deviceLabel,
    };

    const cmd: WardenCommand = {
      addWebAuthnRegistrationToLoggedInUser: inCmd,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    return rval.addWebAuthnRegistrationToLoggedInUser;
  }

  public async performLoginCmd(login: WardenLoginRequest): Promise<WardenLoginResults> {
    const loginCmd: WardenCommand = {
      performLogin: login,
    };
    const cmdResponse: WardenCommandResponse = await this.exchangeCommand(loginCmd);

    return cmdResponse.performLogin;
  }

  public async refreshJwtToken(oldJwtToken: string): Promise<string> {
    let rval: string = null;
    if (StringRatchet.trimToNull(oldJwtToken)) {
      try {
        const resp: WardenCommandResponse = await this.exchangeCommand({ refreshJwtToken: oldJwtToken });
        rval = resp.refreshJwtToken;
      } catch (err) {
        Logger.error('JwtRefresh Failed : %s', err);
      }
    }
    return rval;
  }

  public async executeExpiringTokenBasedLogin(contact: WardenContact, expiringToken: string): Promise<WardenLoginResults> {
    let rval: WardenLoginResults = null;
    try {
      const loginCmd: WardenLoginRequest = {
        contact: contact,
        expiringToken: expiringToken,
      };
      rval = await this.performLoginCmd(loginCmd);
      if (rval?.jwtToken) {
        //rval = true;
      }
    } catch (err) {
      Logger.error('ExpiringToken login Failed : %s', err);
    }
    return rval;
  }
}

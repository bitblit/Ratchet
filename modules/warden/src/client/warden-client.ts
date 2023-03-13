//    Service for interacting with positions for a given user
import { WardenCommand } from '../common/command/warden-command';
import { WardenContact } from '../common/model/warden-contact';
import { WardenCommandExchangeProvider } from './provider/warden-command-exchange-provider';
import { WardenCommandResponse } from '../common/command/warden-command-response';
import { ErrorRatchet, Logger, RequireRatchet, StringRatchet } from '@bitblit/ratchet-common';
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types';
import { WardenLoginResults } from '../common/model/warden-login-results';
import { WardenLoginRequest } from '../common/model/warden-login-request';
import { WardenClientCurrentLoggedInJwtTokenProvider } from './provider/warden-client-current-logged-in-jwt-token-provider';
import { WardenEntrySummary } from '../common/model/warden-entry-summary';

export class WardenClient {
  constructor(private commandSender: WardenCommandExchangeProvider, private jwtProvider: WardenClientCurrentLoggedInJwtTokenProvider) {
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

  public async generateWebAuthnAuthenticationChallengeForUserId(userId: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const cmd: WardenCommand = {
      generateWebAuthnAuthenticationChallengeForUserId: userId,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    const parsed: PublicKeyCredentialRequestOptionsJSON = JSON.parse(rval.generateWebAuthnAuthenticationChallengeForUserId.dataAsJson);
    return parsed;
  }

  public async generateWebAuthnRegistrationChallengeForLoggedInUser(): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const cmd: WardenCommand = {
      generateWebAuthnRegistrationChallengeForLoggedInUser: true,
    };
    const rval: WardenCommandResponse = await this.exchangeCommand(cmd);
    //Logger.info('generateWebAuthnRegistrationChallengeForLoggedInUser: %j', rval);
    const parsed: PublicKeyCredentialCreationOptionsJSON = JSON.parse(rval.generateWebAuthnRegistrationChallengeForLoggedInUser.dataAsJson);
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

  public async addWebAuthnRegistrationToLoggedInUser(data: RegistrationResponseJSON): Promise<WardenEntrySummary> {
    const cmd: WardenCommand = {
      addWebAuthnRegistrationToLoggedInUser: {
        dataAsJson: JSON.stringify(data),
      },
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
        //TODO: this.localStorageService.setJwtToken(req.jwtToken);
        //rval = true;
      }
    } catch (err) {
      Logger.error('ExpiringToken login Failed : %s', err);
    }
    return rval;
  }
}

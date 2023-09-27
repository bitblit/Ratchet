import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import {
  AuthenticationResponseJSON,
  AuthenticatorDevice,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types';
import { WardenServiceOptions } from './warden-service-options.js';
import { WardenEntry } from '@bitblit/ratchet-warden-common';
import { WardenStoreRegistrationResponse } from '@bitblit/ratchet-warden-common';
import { WardenUserDecoration } from '@bitblit/ratchet-warden-common';
import { WardenUtils } from '@bitblit/ratchet-warden-common';
import { WardenJwtToken } from '@bitblit/ratchet-warden-common';

import { WardenMessageSendingProvider } from './provider/warden-message-sending-provider.js';
import { ExpiringCode } from '@bitblit/ratchet-aws';
import { ExpiringCodeRatchet } from '@bitblit/ratchet-aws';

import { Logger } from '@bitblit/ratchet-common';
import { StringRatchet } from '@bitblit/ratchet-common';
import { ErrorRatchet } from '@bitblit/ratchet-common';
import { RequireRatchet } from '@bitblit/ratchet-common';
import { ExpiredJwtHandling } from '@bitblit/ratchet-common';
import { Base64Ratchet } from '@bitblit/ratchet-common';

import { WardenDefaultUserDecorationProvider } from './provider/warden-default-user-decoration-provider.js';
import { WardenNoOpEventProcessingProvider } from './provider/warden-no-op-event-processing-provider.js';
import { WardenContact } from '@bitblit/ratchet-warden-common';
import { WardenCommand } from '@bitblit/ratchet-warden-common';
import { WardenCommandResponse } from '@bitblit/ratchet-warden-common';
import { WardenLoginRequest } from '@bitblit/ratchet-warden-common';
import { WardenLoginResults } from '@bitblit/ratchet-warden-common';
import { WardenStoreRegistrationResponseType } from '@bitblit/ratchet-warden-common';
import { WardenWebAuthnEntry } from '@bitblit/ratchet-warden-common';
import { WardenCustomerMessageType } from '@bitblit/ratchet-warden-common';

export class WardenService {
  private opts: WardenServiceOptions;
  private expiringCodeRatchet: ExpiringCodeRatchet;

  constructor(private inOptions: WardenServiceOptions) {
    RequireRatchet.notNullOrUndefined(inOptions, 'options');
    RequireRatchet.notNullOrUndefined(inOptions.relyingPartyName, 'options.relyingPartyName');
    RequireRatchet.notNullUndefinedOrEmptyArray(inOptions.allowedOrigins, 'options.allowedOrigins');
    RequireRatchet.notNullOrUndefined(inOptions.storageProvider, 'options.storageProvider');
    RequireRatchet.notNullUndefinedOrEmptyArray(inOptions.messageSendingProviders, 'options.messageSendingProviders');
    RequireRatchet.notNullOrUndefined(inOptions.expiringCodeProvider, 'options.expiringCodeProvider');
    RequireRatchet.notNullOrUndefined(inOptions.jwtRatchet, 'options.jwtRatchet');

    this.opts = Object.assign(
      { userTokenDataProvider: new WardenDefaultUserDecorationProvider(), eventProcessor: new WardenNoOpEventProcessingProvider() },
      inOptions,
    );

    this.expiringCodeRatchet = new ExpiringCodeRatchet(this.opts.expiringCodeProvider);
  }

  public get options(): WardenServiceOptions {
    return Object.assign({}, this.opts); // Don't allow a reader to change
  }

  // Passthru for very common use case
  public findEntryByContact(contact: WardenContact): Promise<WardenEntry> {
    return this.opts.storageProvider.findEntryByContact(contact);
  }

  // Passthru for very common use case
  public findEntryById(userId: string): Promise<WardenEntry> {
    return this.opts.storageProvider.findEntryById(userId);
  }

  // A helper function for bridging across GraphQL as an embedded JSON command
  public async processCommandStringToString(cmdString: string, origin: string, loggedInUserId: string): Promise<string> {
    let rval: string = null;
    try {
      const cmd: WardenCommand = JSON.parse(cmdString);
      const resp: WardenCommandResponse = await this.processCommandToResponse(cmd, origin, loggedInUserId);
      if (resp === null) {
        Logger.warn('Response was null for %s %s %s', cmdString, origin, loggedInUserId);
      } else {
        rval = JSON.stringify(resp);
      }
    } catch (err) {
      // Just cast it directly
      const errString: string = ErrorRatchet.safeStringifyErr(err);
      Logger.error('Failed %s : %j', errString, cmdString, err);
      rval = JSON.stringify({ error: errString } as WardenCommandResponse);
    }
    return rval;
  }

  // A helper function for bridging across GraphQL as an embedded JSON command
  public async processCommandToResponse(cmd: WardenCommand, origin: string, loggedInUserId: string): Promise<WardenCommandResponse> {
    let rval: WardenCommandResponse = null;
    if (cmd) {
      Logger.info('Processing command : UserID: %s  Origin: %s Command: %j', loggedInUserId, origin, cmd);

      if (cmd.sendExpiringValidationToken) {
        rval = { sendExpiringValidationToken: await this.sendExpiringValidationToken(cmd.sendExpiringValidationToken) };
      } else if (cmd.generateWebAuthnAuthenticationChallengeForUserId) {
        const tmp: PublicKeyCredentialRequestOptionsJSON = await this.generateWebAuthnAuthenticationChallengeForUserId(
          cmd.generateWebAuthnAuthenticationChallengeForUserId,
          origin,
        );
        rval = { generateWebAuthnAuthenticationChallengeForUserId: { dataAsJson: JSON.stringify(tmp) } };
      } else if (cmd.createAccount) {
        rval = {
          createAccount: await this.createAccount(
            cmd.createAccount.contact,
            cmd.createAccount.sendCode,
            cmd.createAccount.label,
            cmd.createAccount.tags,
          ),
        };
      } else if (cmd.sendMagicLink) {
        let contact: WardenContact = cmd.sendMagicLink.contact;
        if (!contact && cmd?.sendMagicLink?.userId) {
          const entry: WardenEntry = await this.findEntryById(cmd.sendMagicLink.userId);
          if (entry) {
            if (cmd.sendMagicLink.contactType) {
              // Use the one specified, otherwise just first one
              contact = (entry.contactMethods || []).find((cm) => cm.type === cmd.sendMagicLink.contactType);
            } else {
              contact = (entry.contactMethods || []).length > 0 ? entry.contactMethods[0] : null;
            }
          }
        }
        if (!contact) {
          throw ErrorRatchet.fErr('Could not find contract entry either directly or by lookup');
        }
        rval = {
          sendMagicLink: await this.sendMagicLink(
            contact,
            cmd.sendMagicLink.landingUrl,
            cmd.sendMagicLink.meta,
            cmd.sendMagicLink.ttlSeconds,
          ),
        };
      } else if (cmd.generateWebAuthnRegistrationChallengeForLoggedInUser) {
        if (!StringRatchet.trimToNull(loggedInUserId)) {
          ErrorRatchet.throwFormattedErr('This requires a logged in user');
        }
        const tmp: PublicKeyCredentialCreationOptionsJSON = await this.generateWebAuthnRegistrationChallengeForLoggedInUser(
          loggedInUserId,
          origin,
        );
        rval = { generateWebAuthnRegistrationChallengeForLoggedInUser: { dataAsJson: JSON.stringify(tmp) } };
      } else if (cmd.addContactToLoggedInUser) {
        if (!WardenUtils.validContact(cmd.addContactToLoggedInUser)) {
          ErrorRatchet.throwFormattedErr('Cannot add, invalid contact %j', cmd.addContactToLoggedInUser);
        } else {
          const out: boolean = await this.addContactMethodToUser(loggedInUserId, cmd.addContactToLoggedInUser);
          rval = { addContactToLoggedInUser: out };
        }
      } else if (cmd.addWebAuthnRegistrationToLoggedInUser) {
        if (!StringRatchet.trimToNull(loggedInUserId)) {
          ErrorRatchet.throwFormattedErr('This requires a logged in user');
        }
        const data: RegistrationResponseJSON = JSON.parse(cmd.addWebAuthnRegistrationToLoggedInUser.dataAsJson);
        const out: WardenStoreRegistrationResponse = await this.storeAuthnRegistration(loggedInUserId, origin, data);
        if (out.updatedEntry) {
          rval = { addWebAuthnRegistrationToLoggedInUser: WardenUtils.stripWardenEntryToSummary(out.updatedEntry) };
        } else if (out.error) {
          rval = { error: out.error };
        } else {
          rval = { error: 'Cannot happen - neither user nor error set' };
        }
      } else if (cmd.removeWebAuthnRegistration) {
        const modified: WardenEntry = await this.removeSingleWebAuthnRegistration(
          cmd.removeWebAuthnRegistration.userId,
          cmd.removeWebAuthnRegistration.credentialId,
        );
        rval = {
          removeWebAuthnRegistration: WardenUtils.stripWardenEntryToSummary(modified),
        };
      } else if (cmd.removeWebAuthnRegistrationFromLoggedInUser) {
        const modified: WardenEntry = await this.removeSingleWebAuthnRegistration(
          loggedInUserId,
          cmd.removeWebAuthnRegistrationFromLoggedInUser,
        );
        rval = {
          removeWebAuthnRegistrationFromLoggedInUser: WardenUtils.stripWardenEntryToSummary(modified),
        };
      } else if (cmd.removeContactFromLoggedInUser) {
        const output: WardenEntry = await this.removeContactMethodFromUser(loggedInUserId, cmd.removeContactFromLoggedInUser);
        // wardencontact
        rval = {
          removeContactFromLoggedInUser: WardenUtils.stripWardenEntryToSummary(output),
        };
        // return WardenEntrySummary
      } else if (cmd.performLogin) {
        const loginData: WardenLoginRequest = cmd.performLogin;
        const loginOk: boolean = await this.processLogin(loginData, origin);
        Logger.info('Performing login - login auth check was : %s', loginOk);
        if (loginOk) {
          const user: WardenEntry = StringRatchet.trimToNull(loginData.userId)
            ? await this.opts.storageProvider.findEntryById(loginData.userId)
            : await this.opts.storageProvider.findEntryByContact(loginData.contact);
          const decoration: WardenUserDecoration<any> = await this.opts.userDecorationProvider.fetchDecoration(user);
          const wardenToken: WardenJwtToken<any> = {
            loginData: WardenUtils.stripWardenEntryToSummary(user),
            user: decoration.userTokenData,
            roles: WardenUtils.teamRolesToRoles(decoration.userTeamRoles),
            proxy: null,
          };
          const jwtToken: string = await this.opts.jwtRatchet.createTokenString(wardenToken, decoration.userTokenExpirationSeconds);
          const output: WardenLoginResults = {
            request: loginData,
            userId: user.userId,
            jwtToken: jwtToken,
          };
          rval = { performLogin: output };
        } else {
          rval = { error: 'Login failed' };
        }
      } else if (cmd.refreshJwtToken) {
        const parsed: WardenJwtToken<any> = await this.opts.jwtRatchet.decodeToken(cmd.refreshJwtToken, ExpiredJwtHandling.THROW_EXCEPTION);
        const user: WardenEntry = await this.opts.storageProvider.findEntryById(parsed.loginData.userId);
        const decoration: WardenUserDecoration<any> = await this.opts.userDecorationProvider.fetchDecoration(user);
        const wardenToken: WardenJwtToken<any> = {
          loginData: WardenUtils.stripWardenEntryToSummary(user),
          user: decoration.userTokenData,
          roles: WardenUtils.teamRolesToRoles(decoration.userTeamRoles),
          proxy: null,
        };

        const newToken: string = await this.opts.jwtRatchet.createTokenString(wardenToken, decoration.userTokenExpirationSeconds);
        // CAW : We dont use refresh token because we want any user changes to show up in the new token
        //const newToken: string = await this.opts.jwtRatchet.refreshJWTString(cmd.refreshJwtToken, false, expirationSeconds);
        rval = {
          refreshJwtToken: newToken,
        };
      }
    } else {
      rval = { error: 'No command sent' };
    }
    return rval;
  }

  public urlIsOnAllowedOrigin(url: string): boolean {
    let rval: boolean = false;
    if (url) {
      const u: URL = new URL(url);
      for (let i = 0; i < this.opts.allowedOrigins.length && !rval; i++) {
        const test: URL = new URL(this.opts.allowedOrigins[i]);
        rval = test.origin === u.origin && test.protocol === u.protocol && test.port === u.port;
      }
    }
    return rval;
  }

  public async sendMagicLink(
    contact: WardenContact,
    landingUrl: string,
    metaIn?: Record<string, string>,
    ttlSeconds: number = 300,
  ): Promise<boolean> {
    let rval: boolean = false;
    RequireRatchet.notNullOrUndefined(contact, 'contact');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(landingUrl, 'landingUrl');
    RequireRatchet.true(this.urlIsOnAllowedOrigin(landingUrl), 'landingUrl is not on an allowed origin for redirect');

    if (contact?.type && StringRatchet.trimToNull(contact?.value)) {
      const prov: WardenMessageSendingProvider<any> = this.senderForContact(contact);
      if (prov) {
        const token: ExpiringCode = await this.expiringCodeRatchet.createNewCode({
          context: contact.value,
          length: 36,
          alphabet: StringRatchet.UPPER_CASE_LATIN,
          timeToLiveSeconds: ttlSeconds,
          tags: ['MagicLink'],
        });

        const meta: Record<string, any> = Object.assign({}, metaIn || {}, { contact: contact });
        const encodedMeta: string = Base64Ratchet.safeObjectToBase64JSON(meta || {});

        let landingUrlFilled: string = landingUrl;
        landingUrlFilled = landingUrlFilled.split('{CODE}').join(token.code);
        landingUrlFilled = landingUrlFilled.split('{META}').join(encodedMeta);

        const context: Record<string, string> = Object.assign({}, meta || {}, {
          landingUrl: landingUrlFilled,
          code: token.code,
          relyingPartyName: this.opts.relyingPartyName,
        });

        const msg: any = await prov.formatMessage(contact, WardenCustomerMessageType.MagicLink, context);
        rval = await prov.sendMessage(contact, msg);
      } else {
        ErrorRatchet.throwFormattedErr('No provider found for contact type %s', contact.type);
      }
    } else {
      ErrorRatchet.throwFormattedErr('Cannot send - invalid contact %j', contact);
    }
    return rval;
  }

  // Creates a new account, returns the userId for that account upon success
  public async createAccount(contact: WardenContact, sendCode?: boolean, label?: string, tags?: string[]): Promise<string> {
    let rval: string = null;
    if (WardenUtils.validContact(contact)) {
      const old: WardenEntry = await this.opts.storageProvider.findEntryByContact(contact);
      if (!!old) {
        ErrorRatchet.throwFormattedErr('Cannot create - account already exists for %j', contact);
      }

      const prov: WardenMessageSendingProvider<any> = this.senderForContact(contact);
      if (!prov) {
        ErrorRatchet.throwFormattedErr('Cannot create - no sending provider for type %s', contact.type);
      }
      const guid: string = StringRatchet.createType4Guid();
      const now: number = Date.now();
      const newUser: WardenEntry = {
        userId: guid,
        userLabel: label || 'User ' + guid, // Usually full name, could be something else
        contactMethods: [contact],
        tags: tags || [],
        webAuthnAuthenticators: [],
        createdEpochMS: now,
        updatedEpochMS: now,
      };
      const next: WardenEntry = await this.opts.storageProvider.saveEntry(newUser);
      rval = next.userId;
      if (this?.opts?.eventProcessor) {
        await this.opts.eventProcessor.userCreated(next);
      }

      if (sendCode) {
        Logger.info('New user %j created and send requested - sending', next);
        await this.sendExpiringValidationToken(contact);
      }
    } else {
      ErrorRatchet.throwFormattedErr('Cannot create - invalid contact (missing or invalid fields)');
    }
    return rval;
  }

  // For an existing user, add another contact method
  // A given contact (eg, email address, phone number) can only associated with a single
  // userId at a time
  public async addContactMethodToUser(userId: string, contact: WardenContact): Promise<boolean> {
    let rval: boolean = false;
    if (StringRatchet.trimToNull(userId) && WardenUtils.validContact(contact)) {
      const otherUser: WardenEntry = await this.opts.storageProvider.findEntryByContact(contact);
      if (otherUser && otherUser.userId !== userId) {
        ErrorRatchet.throwFormattedErr('Cannot add contact to this user, another user already has that contact');
      }
      const curUser: WardenEntry = await this.opts.storageProvider.findEntryById(userId);
      if (!curUser) {
        ErrorRatchet.throwFormattedErr('Cannot add contact to this user, user does not exist');
      }
      curUser.contactMethods.push(contact);
      await this.opts.storageProvider.saveEntry(curUser);
      rval = true;
    } else {
      ErrorRatchet.throwFormattedErr('Cannot add - invalid config : %s %j', userId, contact);
    }
    return rval;
  }

  // For an existing user, remove a contact method
  public async removeContactMethodFromUser(userId: string, contact: WardenContact): Promise<WardenEntry> {
    let rval: WardenEntry = null;
    if (StringRatchet.trimToNull(userId) && WardenUtils.validContact(contact)) {
      const curUser: WardenEntry = await this.opts.storageProvider.findEntryById(userId);
      if (!curUser) {
        ErrorRatchet.throwFormattedErr('Cannot remove contact from this user, user does not exist');
      }
      curUser.contactMethods = (curUser.contactMethods || []).filter((s) => s.type !== contact.type || s.value !== contact.value);
      if (curUser.contactMethods.length === 0) {
        ErrorRatchet.throwFormattedErr('Cannot remove the last contact method from a user');
      }
      await this.opts.storageProvider.saveEntry(curUser);
      rval = await this.opts.storageProvider.findEntryById(userId);
    } else {
      ErrorRatchet.throwFormattedErr('Cannot add - invalid config : %s %j', userId, contact);
    }
    return rval;
  }

  // Used as the first step of adding a new WebAuthn device to an existing (logged in) user
  // Server creates a challenge that the device will sign
  public async generateWebAuthnRegistrationChallengeForLoggedInUser(
    userId: string,
    origin: string,
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    if (!origin || !this.opts.allowedOrigins.includes(origin)) {
      throw new Error('Invalid origin : ' + origin);
    }
    const asUrl: URL = new URL(origin);
    const rpID: string = asUrl.hostname;

    const entry: WardenEntry = await this.opts.storageProvider.findEntryById(userId);
    const options = await generateRegistrationOptions({
      rpName: this.opts.relyingPartyName,
      rpID: rpID,
      userID: entry.userId,
      userName: entry.userLabel,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: 'none',
      // Prevent users from re-registering existing authenticators
      excludeCredentials: entry.webAuthnAuthenticators.map((authenticator) => ({
        id: Base64Ratchet.base64StringToUint8Array(authenticator.credentialPublicKeyBase64),
        type: 'public-key',
        // Optional
        transports: authenticator.transports as unknown as AuthenticatorTransportFuture[],
      })),
    });

    await this.opts.storageProvider.updateUserChallenge(entry.userId, rpID, options.challenge);

    return options;
  }

  // Given a new device's registration, add it to the specified user account as a valid login method
  public async storeAuthnRegistration(
    userId: string,
    origin: string,
    data: RegistrationResponseJSON,
  ): Promise<WardenStoreRegistrationResponse> {
    Logger.info('Store authn data : %j', data);
    let rval: WardenStoreRegistrationResponse = null;
    try {
      if (!origin || !this.opts.allowedOrigins.includes(origin)) {
        throw new Error('Invalid origin : ' + origin);
      }
      const asUrl: URL = new URL(origin);
      const rpID: string = asUrl.hostname;

      const user: WardenEntry = await this.opts.storageProvider.findEntryById(userId);
      // (Pseudocode) Get `options.challenge` that was saved above
      const expectedChallenge: string = await this.opts.storageProvider.fetchCurrentUserChallenge(user.userId, rpID);

      const vrOpts: VerifyRegistrationResponseOpts = {
        response: data,
        expectedChallenge: expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      };

      Logger.info('Calling verifyRegistrationResponse: %j', vrOpts);

      const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse(vrOpts);
      Logger.info('verifyRegistrationResponse Result : %j', verification);

      rval = {
        updatedEntry: null,
        registrationResponseId: data.id,
        result: verification.verified ? WardenStoreRegistrationResponseType.Verified : WardenStoreRegistrationResponseType.Failed,
      };

      if (rval.result === WardenStoreRegistrationResponseType.Verified) {
        Logger.info('Storing registration');
        const newAuth: WardenWebAuthnEntry = {
          counter: verification.registrationInfo.counter,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialIdBase64: Base64Ratchet.generateBase64VersionOfString(data.id), //Base64Ratchet.generateBase64VersionOfBuffer(verification.registrationInfo.credentialID),
          credentialPublicKeyBase64: Base64Ratchet.generateBase64VersionOfUint8Array(
            Buffer.from(verification.registrationInfo.credentialPublicKey),
          ),
          //transports: TBD
        };

        // (Pseudocode) Save the authenticator info so that we can
        // get it by user ID later
        user.webAuthnAuthenticators = (user.webAuthnAuthenticators || []).filter(
          (wa) => wa.credentialIdBase64 !== newAuth.credentialIdBase64,
        );
        user.webAuthnAuthenticators.push(newAuth);
        const storedUser: WardenEntry = await this.opts.storageProvider.saveEntry(user);
        rval.updatedEntry = storedUser;
        Logger.info('Stored auth : %j', storedUser);
      }
    } catch (err) {
      rval = {
        registrationResponseId: data.id,
        result: WardenStoreRegistrationResponseType.Error,
        error: ErrorRatchet.safeStringifyErr(err),
      };
    }

    return rval;
  }

  public async generateWebAuthnAuthenticationChallengeForUserId(
    userId: string,
    origin: string,
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const user: WardenEntry = await this.opts.storageProvider.findEntryById(userId);
    const rval: PublicKeyCredentialRequestOptionsJSON = await this.generateWebAuthnAuthenticationChallenge(user, origin);
    return rval;
  }

  // Part of the login process - for a given user, generate the challenge that the deviec will have to answer
  public async generateWebAuthnAuthenticationChallenge(user: WardenEntry, origin: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
    // (Pseudocode) Retrieve any of the user's previously-
    // registered authenticators
    const userAuthenticators: WardenWebAuthnEntry[] = user.webAuthnAuthenticators;
    if (!origin || !this.opts.allowedOrigins.includes(origin)) {
      throw new Error('Invalid origin : ' + origin);
    }
    const asUrl: URL = new URL(origin);
    const rpID: string = asUrl.hostname;

    const out: any[] = userAuthenticators.map((authenticator) => {
      const next: any = {
        id: Buffer.from(authenticator.credentialIdBase64, 'base64'),
        type: 'public-key',
        // Optional
        transports: authenticator.transports,
      };
      return next;
    });

    const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
      // Require users to use a previously-registered authenticator
      allowCredentials: out,
      userVerification: 'preferred',
    });

    // (Pseudocode) Remember this challenge for this user
    await this.opts.storageProvider.updateUserChallenge(user.userId, rpID, options.challenge);

    return options;
  }

  // For a given contact type, find the sender that can be used to send messages to it
  public senderForContact(contact: WardenContact): WardenMessageSendingProvider<any> {
    let rval: WardenMessageSendingProvider<any> = null;
    if (contact?.type) {
      rval = (this.opts.messageSendingProviders || []).find((p) => p.handlesContactType(contact.type));
    }
    return rval;
  }

  // Send a single use token to this contact
  public async sendExpiringValidationToken(request: WardenContact): Promise<boolean> {
    let rval: boolean = false;
    if (request?.type && StringRatchet.trimToNull(request?.value)) {
      const prov: WardenMessageSendingProvider<any> = this.senderForContact(request);
      if (prov) {
        const token: ExpiringCode = await this.expiringCodeRatchet.createNewCode({
          context: request.value,
          length: 6,
          alphabet: '0123456789',
          timeToLiveSeconds: 300,
          tags: ['Login'],
        });
        const msg: any = await prov.formatMessage(request, WardenCustomerMessageType.ExpiringCode, {
          code: token.code,
          relyingPartyName: this.opts.relyingPartyName,
        });
        rval = await prov.sendMessage(request, msg);
      } else {
        ErrorRatchet.throwFormattedErr('No provider found for contact type %s', request.type);
      }
    } else {
      ErrorRatchet.throwFormattedErr('Cannot send - invalid request %j', request);
    }
    return rval;
  }

  // Perform a login using one of several methods
  // Delegates to functions that handle the specific methods
  public async processLogin(request: WardenLoginRequest, origin: string): Promise<boolean> {
    Logger.info('Processing login : %s : %j', origin, request);
    let rval: boolean = false;
    RequireRatchet.notNullOrUndefined(request, 'request');
    RequireRatchet.true(
      !!StringRatchet.trimToNull(request?.userId) || WardenUtils.validContact(request?.contact),
      'Invalid contact and no userId',
    );
    RequireRatchet.true(
      !!request?.webAuthn || !!StringRatchet.trimToNull(request?.expiringToken),
      'You must provide one of webAuthn or expiringToken',
    );
    RequireRatchet.true(
      !request?.webAuthn || !StringRatchet.trimToNull(request?.expiringToken),
      'WebAuthn and ExpiringToken may not BOTH be set',
    );

    const user: WardenEntry = StringRatchet.trimToNull(request?.userId)
      ? await this.opts.storageProvider.findEntryById(request?.userId)
      : await this.opts.storageProvider.findEntryByContact(request.contact);
    if (!user) {
      ErrorRatchet.throwFormattedErr('No user found for %j / %s', request?.contact, request?.userId);
    }

    if (request.webAuthn) {
      rval = await this.loginWithWebAuthnRequest(user, origin, request.webAuthn);
    } else if (StringRatchet.trimToNull(request.expiringToken)) {
      const lookup: boolean = await this.expiringCodeRatchet.checkCode(
        StringRatchet.trimToEmpty(request.expiringToken),
        StringRatchet.trimToEmpty(request.contact.value),
        true,
      );
      if (lookup) {
        rval = true;
      } else {
        ErrorRatchet.throwFormattedErr('Cannot login - token is invalid for this user');
      }
    }
    return rval;
  }

  // Perform a login using webAuthn
  public async loginWithWebAuthnRequest(user: WardenEntry, origin: string, data: AuthenticationResponseJSON): Promise<boolean> {
    let rval: boolean = false;
    const asUrl: URL = new URL(origin);
    const rpID: string = asUrl.hostname;
    const expectedChallenge: string = await this.opts.storageProvider.fetchCurrentUserChallenge(user.userId, rpID);

    // (Pseudocode} Retrieve an authenticator from the DB that
    // should match the `id` in the returned credential
    //const b64id: string = Base64Ratchet.base64StringToString(data.id);
    const auth: WardenWebAuthnEntry = (user.webAuthnAuthenticators || []).find((s) => s.credentialIdBase64 === data.id);

    if (!auth) {
      throw new Error(`Could not find authenticator ${data.id} for user ${user.userId}`);
    }

    const authenticator: AuthenticatorDevice = {
      counter: auth.counter,
      credentialID: Base64Ratchet.base64StringToUint8Array(auth.credentialIdBase64),
      credentialPublicKey: Base64Ratchet.base64StringToUint8Array(auth.credentialPublicKeyBase64),
    };

    const vrOpts: VerifyAuthenticationResponseOpts = {
      response: data,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator,
    };

    const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse(vrOpts);

    if (verification.verified) {
      rval = true;
    }
    return rval;
  }

  // Unregisters a device from a given user account
  public async removeSingleWebAuthnRegistration(userId: string, key: string): Promise<WardenEntry> {
    let ent: WardenEntry = await this.opts.storageProvider.findEntryById(userId);
    if (ent) {
      ent.webAuthnAuthenticators = (ent.webAuthnAuthenticators || []).filter((s) => s.credentialIdBase64 !== key);
      ent = await this.opts.storageProvider.saveEntry(ent);
    } else {
      Logger.info('Not removing - no such user as %s', userId);
    }
    return ent;
  }

  // Admin function - pass thru to the storage layer
  public async removeUser(userId: string): Promise<boolean> {
    let rval: boolean = false;
    if (StringRatchet.trimToNull(userId)) {
      const oldUser: WardenEntry = await this.opts.storageProvider.findEntryById(userId);
      if (oldUser) {
        await this.opts.storageProvider.removeEntry(userId);
        if (this?.opts?.eventProcessor) {
          await this.opts.eventProcessor.userRemoved(oldUser);
        }
        rval = true;
      } else {
        Logger.warn('Cannot remove non-existent user : %s', userId);
      }
    }

    return rval;
  }
}

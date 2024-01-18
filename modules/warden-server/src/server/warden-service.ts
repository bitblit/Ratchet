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
import {
  WardenCommand,
  WardenCommandResponse,
  WardenContact,
  WardenEntry,
  WardenJwtToken,
  WardenLoginRequest,
  WardenLoginResults,
  WardenStoreRegistrationResponse,
  WardenStoreRegistrationResponseType,
  WardenUserDecoration,
  WardenUtils,
  WardenWebAuthnEntry,
} from '@bitblit/ratchet-warden-common';

import { Base64Ratchet, ErrorRatchet, ExpiredJwtHandling, Logger, RequireRatchet, StringRatchet } from '@bitblit/ratchet-common';

import { WardenDefaultUserDecorationProvider } from './provider/warden-default-user-decoration-provider.js';
import { WardenNoOpEventProcessingProvider } from './provider/warden-no-op-event-processing-provider.js';
import { WardenSingleUseCodeProvider } from './provider/warden-single-use-code-provider';
import { WardenDefaultSendMagicLinkCommandValidator } from './provider/warden-default-send-magic-link-command-validator';

export class WardenService {
  private opts: WardenServiceOptions;

  constructor(private inOptions: WardenServiceOptions) {
    RequireRatchet.notNullOrUndefined(inOptions, 'options');
    RequireRatchet.notNullOrUndefined(inOptions.relyingPartyName, 'options.relyingPartyName');
    RequireRatchet.notNullUndefinedOrEmptyArray(inOptions.allowedOrigins, 'options.allowedOrigins');
    RequireRatchet.notNullOrUndefined(inOptions.storageProvider, 'options.storageProvider');
    RequireRatchet.notNullOrUndefined(inOptions.jwtRatchet, 'options.jwtRatchet');
    RequireRatchet.notNullUndefinedOrEmptyArray(inOptions.singleUseCodeProviders, 'options.singleUseCodeProviders');

    this.opts = Object.assign(
      {
        userTokenDataProvider: new WardenDefaultUserDecorationProvider(),
        eventProcessor: new WardenNoOpEventProcessingProvider(),
        sendMagicLinkCommandValidator: new WardenDefaultSendMagicLinkCommandValidator(),
      },
      inOptions,
    );
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
        if (cmd?.sendMagicLink?.contactLookup && cmd?.sendMagicLink?.contact) {
          throw ErrorRatchet.fErr('You may not specify both contact and contactLookup');
        }
        if (!cmd?.sendMagicLink?.contactLookup && !cmd?.sendMagicLink?.contact) {
          throw ErrorRatchet.fErr('You must not specify either contact and contactLookup');
        }
        if (cmd.sendMagicLink.contactLookup) {
          const entry: WardenEntry = await this.findEntryById(cmd.sendMagicLink.contactLookup.userId);
          if (entry) {
            if (cmd.sendMagicLink.contactLookup.contactType) {
              // Use the one specified, otherwise just first one
              cmd.sendMagicLink.contact = (entry.contactMethods || []).find(
                (cm) => cm.type === cmd.sendMagicLink.contactLookup.contactType,
              );
            } else {
              cmd.sendMagicLink.contact = (entry.contactMethods || []).length > 0 ? entry.contactMethods[0] : null;
            }
          }
          cmd.sendMagicLink.contactLookup = null;
        }

        if (!cmd.sendMagicLink.contact) {
          throw ErrorRatchet.fErr('Could not find contract entry either directly or by lookup');
        }
        // Now run all allowance checks on the link
        const loggedInUser: WardenEntry = StringRatchet.trimToNull(loggedInUserId)
          ? await this.opts.storageProvider.findEntryById(loggedInUserId)
          : null;

        await this.opts.sendMagicLinkCommandValidator.allowMagicLinkCommand(cmd.sendMagicLink, origin, loggedInUser);

        const ttlSeconds: number = cmd?.sendMagicLink?.ttlSeconds || 300;

        rval = {
          sendMagicLink: await this.sendMagicLink(
            cmd.sendMagicLink.contact,
            cmd.sendMagicLink.overrideDestinationContact,
            this.opts.relyingPartyName,
            cmd.sendMagicLink.landingUrl,
            cmd.sendMagicLink.meta,
            ttlSeconds,
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
        const data: RegistrationResponseJSON = JSON.parse(cmd.addWebAuthnRegistrationToLoggedInUser.webAuthn.dataAsJson);
        const out: WardenStoreRegistrationResponse = await this.storeAuthnRegistration(
          loggedInUserId,
          origin,
          cmd.addWebAuthnRegistrationToLoggedInUser.applicationName,
          cmd.addWebAuthnRegistrationToLoggedInUser.deviceLabel,
          data,
        );
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
        // CAW : We do not use refresh token because we want any user changes to show up in the new token
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

  public singleUseCodeProvider(
    contact: WardenContact,
    requireMagicLinkSupport: boolean,
    returnNullIfNoProviders?: boolean,
  ): WardenSingleUseCodeProvider {
    const rval: WardenSingleUseCodeProvider = this.opts.singleUseCodeProviders.find(
      (s) => s.handlesContactType(contact.type) && (!requireMagicLinkSupport || s.createCodeAndSendMagicLink),
    );
    if (!rval && !returnNullIfNoProviders) {
      throw ErrorRatchet.fErr('Cannot find a single use code provider for contact type : %s', contact.type);
    }
    return rval;
  }

  public async sendMagicLink(
    contact: WardenContact,
    overrideDestinationContact: WardenContact,
    relyingPartyName: string,
    landingUrl: string,
    metaIn?: Record<string, string>,
    ttlSeconds?: number,
  ): Promise<boolean> {
    let rval: boolean = false;
    RequireRatchet.notNullOrUndefined(contact, 'contact');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(landingUrl, 'landingUrl');
    RequireRatchet.true(this.urlIsOnAllowedOrigin(landingUrl), 'landingUrl is not on an allowed origin for redirect');

    if (contact?.type && StringRatchet.trimToNull(contact?.value)) {
      const prov: WardenSingleUseCodeProvider = this.singleUseCodeProvider(contact, true);
      rval = await prov.createCodeAndSendMagicLink(contact, relyingPartyName, landingUrl, metaIn, ttlSeconds, overrideDestinationContact);
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
        id: Base64Ratchet.base64UrlStringToBytes(authenticator.credentialPublicKeyBase64),
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
    applicationName: string,
    deviceLabel: string,
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
          origin: origin,
          applicationName: applicationName || 'Unknown Application',
          deviceLabel: deviceLabel || 'Unknown Device',
          counter: verification.registrationInfo.counter,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialIdBase64: Base64Ratchet.uint8ArrayToBase64UrlString(verification.registrationInfo.credentialID),
          credentialPublicKeyBase64: Base64Ratchet.uint8ArrayToBase64UrlString(verification.registrationInfo.credentialPublicKey),
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
        id: Base64Ratchet.base64UrlStringToBytes(authenticator.credentialIdBase64),
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

  // Send a single use token to this contact
  public async sendExpiringValidationToken(request: WardenContact): Promise<boolean> {
    let rval: boolean = false;
    if (request?.type && StringRatchet.trimToNull(request?.value)) {
      const prov: WardenSingleUseCodeProvider = this.singleUseCodeProvider(request, false);
      rval = await prov.createAndSendNewCode(request, this.opts.relyingPartyName);
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
      const prov: WardenSingleUseCodeProvider = this.singleUseCodeProvider(request.contact, false);
      const lookup: boolean = await prov.checkCode(request.contact.value, request.expiringToken);
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
    //const b64id: string = Base64Ratchet.base64UrlStringToString(data.id);
    const auth: WardenWebAuthnEntry = (user.webAuthnAuthenticators || []).find((s) => s.credentialIdBase64 === data.id);

    if (!auth) {
      const allIds: string[] = (user.webAuthnAuthenticators || []).map((s) => s.credentialIdBase64);
      throw ErrorRatchet.fErr('Could not find authenticator %s (%s) for user %s (avail were : %j)', data.id, data.id, user.userId, allIds);
    }

    const authenticator: AuthenticatorDevice = {
      counter: auth.counter,
      credentialID: Base64Ratchet.base64UrlStringToBytes(auth.credentialIdBase64),
      credentialPublicKey: Base64Ratchet.base64UrlStringToBytes(auth.credentialPublicKeyBase64),
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

//    Service for interacting with positions for a given user
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
import { SimpleAuthenticationServiceOptions } from './simple-authentication-service-options';
import { Base64Ratchet } from '../common/base64-ratchet';
import { SimpleAuthenticationStorageProvider } from './provider/simple-authentication-storage-provider';
import { JwtRatchetLike } from '../common/jwt-ratchet-like';
import { Mailer } from '../aws/ses/mailer';
import { ExpiringCodeRatchet } from '../aws/expiring-code/expiring-code-ratchet';
import { SimpleAuthenticationContactEntry } from './model/simple-authentication-contact-entry';
import { SimpleAuthenticationEntry } from './model/simple-authentication-entry';
import { Logger } from '../common/logger';
import { StringRatchet } from '../common/string-ratchet';
import { StoreSimpleAuthenticationRegistrationResponse } from './model/store-simple-authentication-registration-response';
import { SimpleAuthenticationContactType } from './model/simple-authentication-contact-type';
import { SimpleAuthenticationWebAuthnEntry } from './model/simple-authentication-web-authn-entry';
import { ErrorRatchet } from '../common/error-ratchet';
import { SimpleAuthenticationExpiringTokenSendingProvider } from './provider/simple-authentication-expiring-token-sending-provider';
import { ExpiringCode } from '../aws';
import { SimpleAuthenticationLoginRequest } from './model/simple-authentication-login-request';
import { RequireRatchet } from '../common';

export class SimpleAuthenticationService {
  constructor(
    private options: SimpleAuthenticationServiceOptions,
    private storageProvider: SimpleAuthenticationStorageProvider,
    private expiringTokenProviders: SimpleAuthenticationExpiringTokenSendingProvider[],
    private jwtRatchet: JwtRatchetLike,
    private mailer: Mailer,
    private expiringCodeRatchet: ExpiringCodeRatchet
  ) {}

  public async generateWebAuthnRegistrationOptionsForContact(contact: SimpleAuthenticationContactEntry, origin: string): Promise<any> {
    // (Pseudocode) Retrieve the user from the database
    // after they've logged in
    let rval: any = null;
    if (contact?.type && StringRatchet.trimToNull(contact?.value) && StringRatchet.trimToNull(origin)) {
      const entry: SimpleAuthenticationEntry = await this.storageProvider.findEntryByContact(contact);
      rval = this.generateRegistrationOptions(entry, origin);
    }
    return rval;
  }

  public async generateRegistrationOptions(
    entry: SimpleAuthenticationEntry,
    origin: string
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    if (!origin || !this.options.allowedOrigins.includes(origin)) {
      throw new Error('Invalid origin : ' + origin);
    }
    const asUrl: URL = new URL(origin);
    const rpID: string = asUrl.hostname;

    const options = generateRegistrationOptions({
      rpName: this.options.rpName,
      rpID: rpID,
      userID: entry.userId,
      userName: entry.userLabel,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: 'none',
      // Prevent users from re-registering existing authenticators
      excludeCredentials: entry.webAuthnAuthenticators.map((authenticator) => ({
        id: Base64Ratchet.base64StringToBuffer(authenticator.credentialPublicKeyBase64),
        type: 'public-key',
        // Optional
        transports: authenticator.transports as unknown as AuthenticatorTransportFuture[],
      })),
    });

    await this.storageProvider.updateUserChallenge(entry.userId, rpID, options.challenge);

    return options;
  }

  public async storeAuthnRegistration(
    email: string,
    origin: string,
    data: RegistrationResponseJSON
  ): Promise<StoreSimpleAuthenticationRegistrationResponse> {
    Logger.info('Store authn data : %j', data);
    let rval: StoreSimpleAuthenticationRegistrationResponse = null;
    try {
      if (!origin || !this.options.allowedOrigins.includes(origin)) {
        throw new Error('Invalid origin : ' + origin);
      }
      const asUrl: URL = new URL(origin);
      const rpID: string = asUrl.hostname;

      const user: SimpleAuthenticationEntry = await this.storageProvider.findEntryByContact({
        type: SimpleAuthenticationContactType.EmailAddress,
        value: email,
      });
      // (Pseudocode) Get `options.challenge` that was saved above
      const expectedChallenge: string = await this.storageProvider.fetchCurrentUserChallenge(user.userId, rpID);

      const vrOpts: VerifyRegistrationResponseOpts = {
        response: data,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      };

      const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse(vrOpts);
      Logger.info('Result : %j', verification);

      rval = {
        id: data.id,
        result: verification.verified
          ? StoreSimpleAuthenticationRegistrationResponseType.Verified
          : StoreSimpleAuthenticationRegistrationResponseType.Failed,
      };

      if (rval.result === StoreSimpleAuthenticationRegistrationResponseType.Verified) {
        Logger.info('Storing registration');
        const newAuth: SimpleAuthenticationWebAuthnEntry = {
          counter: verification.registrationInfo.counter,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialIdBase64: data.id, //Base64Ratchet.generateBase64VersionOfBuffer(verification.registrationInfo.credentialID),
          credentialPublicKeyBase64: Base64Ratchet.generateBase64VersionOfBuffer(
            Buffer.from(verification.registrationInfo.credentialPublicKey)
          ),
          //transports: TBD
        };

        // (Pseudocode) Save the authenticator info so that we can
        // get it by user ID later
        user.webAuthnAuthenticators = (user.webAuthnAuthenticators || []).filter(
          (wa) => wa.credentialIdBase64 !== newAuth.credentialIdBase64
        );
        user.webAuthnAuthenticators.push(newAuth);
        const storedUser: SimpleAuthenticationEntry = await this.storageProvider.saveEntry(user);
        Logger.info('Stored auth : %j', storedUser);
      }
    } catch (err) {
      rval = {
        id: data.id,
        result: StoreSimpleAuthenticationRegistrationResponseType.Error,
        notes: ErrorRatchet.safeStringifyErr(err),
      };
    }

    return rval;
  }

  public async generateAuthenticationOptionsForEmailAddress(email: string, origin: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
    // (Pseudocode) Retrieve the user from the database
    // after they've logged in
    const user: SimpleAuthenticationEntry = await this.storageProvider.findEntryByContact({
      type: SimpleAuthenticationContactType.EmailAddress,
      value: email,
    });
    const rval: PublicKeyCredentialRequestOptionsJSON = await this.generateAuthenticationOptions(user, origin);
    return rval;
  }

  public async generateAuthenticationOptions(
    user: SimpleAuthenticationEntry,
    origin: string
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    // (Pseudocode) Retrieve any of the user's previously-
    // registered authenticators
    const userAuthenticators: SimpleAuthenticationWebAuthnEntry[] = user.webAuthnAuthenticators;
    if (!origin || !this.options.allowedOrigins.includes(origin)) {
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

    const options: PublicKeyCredentialRequestOptionsJSON = generateAuthenticationOptions({
      // Require users to use a previously-registered authenticator
      allowCredentials: out,
      userVerification: 'preferred',
    });

    // (Pseudocode) Remember this challenge for this user
    await this.storageProvider.updateUserChallenge(user.userId, rpID, options.challenge);

    return options;
  }

  public async sendExpiringValidationToken(request: SimpleAuthenticationContactEntry): Promise<boolean> {
    let rval: boolean = false;
    if (request?.type && StringRatchet.trimToNull(request?.value)) {
      const prov: SimpleAuthenticationExpiringTokenSendingProvider = (this.expiringTokenProviders || []).find((p) =>
        p.handlesContactType(request.type)
      );
      if (prov) {
        const token: ExpiringCode = await this.expiringCodeRatchet.createNewCode({
          context: request.value,
          length: 6,
          alphabet: '0123456789',
          timeToLiveSeconds: 300,
          tags: ['Login'],
        });
        rval = await prov.sendExpiringToken(request, token.code);

        /*
        if (request.method === ParaTradeContactMethod.Email) {
          Logger.info('Sending email');
          const rts: ReadyToSendEmail = {
            destinationAddresses: [request.emailAddress],
            subject: 'Your login token',
          };

          const context: any = {
            token: token.code,
          };

          await this.mailer.fillEmailBodyAndSend(rts, context, 'validation-token-request-email', null, 'email-base');

          rval = true;
        } else if (request.method === ParaTradeContactMethod.TextMessage) {
          Logger.info('Sending text');
          // https://www.macrumors.com/2020/01/31/apple-standardized-format-sms-one-time-passcodes/
          const msg: string = token.code + ' is your ParaTrade authentication code.\n@para.trade #' + token.code;
          const user: ParaTradeUser = await this.userDao.fetchUserByEmail(request.emailAddress);
          const out: any[] = await TextMessageUtil.sendTextMessage([user.contactPhone], msg);

          rval = true;
        } else {
          ErrorRatchet.throwFormattedErr('No such method : %s', request.method);
        }
        
         */
      } else {
        ErrorRatchet.throwFormattedErr('No provider found for contact type %s', request.type);
      }
    } else {
      ErrorRatchet.throwFormattedErr('Cannot send - invalid request %j', request);
    }
    return rval;
  }

  public async processLogin(request: SimpleAuthenticationLoginRequest, origin: string): Promise<boolean> {
    let rval: boolean = false;
    RequireRatchet.notNullOrUndefined(request, 'request');
    RequireRatchet.notNullOrUndefined(request?.contact?.value, 'request.contact.value');
    RequireRatchet.notNullOrUndefined(request?.contact?.type, 'request.contact.type');
    RequireRatchet.true(
      !!request?.webAuthn || !!StringRatchet.trimToNull(request?.expiringToken),
      'You must provide one of webAuthn or expiringToken'
    );
    RequireRatchet.true(
      !request?.webAuthn || !StringRatchet.trimToNull(request?.expiringToken),
      'WebAuthn and ExpiringToken may not BOTH be set'
    );

    const user: SimpleAuthenticationEntry = await this.storageProvider.findEntryByContact(request.contact);
    if (!user) {
      ErrorRatchet.throwFormattedErr('No user found for %j', request.contact);
    }

    if (request.webAuthn) {
      const unwrapped: AuthenticationResponseJSON = JSON.parse(request.webAuthn.payloadJSON);
      rval = await this.loginWithWebAuthnRequest(user, origin, unwrapped);
    } else if (StringRatchet.trimToNull(request.expiringToken)) {
      const lookup: boolean = await this.expiringCodeRatchet.checkCode(
        StringRatchet.trimToEmpty(request.expiringToken),
        StringRatchet.trimToEmpty(request.contact.value),
        true
      );
      if (lookup) {
        rval = true;
      } else {
        ErrorRatchet.throwFormattedErr('Cannot login - token is invalid for this user');
      }
    }
    return rval;
  }

  public async loginWithWebAuthnRequest(
    user: SimpleAuthenticationEntry,
    origin: string,
    data: AuthenticationResponseJSON
  ): Promise<boolean> {
    let rval: boolean = false;
    const asUrl: URL = new URL(origin);
    const rpID: string = asUrl.hostname;
    const expectedChallenge: string = await this.storageProvider.fetchCurrentUserChallenge(user.userId, rpID);

    // (Pseudocode} Retrieve an authenticator from the DB that
    // should match the `id` in the returned credential
    //const b64id: string = Base64Ratchet.base64StringToString(data.id);
    const auth: SimpleAuthenticationWebAuthnEntry = (user.webAuthnAuthenticators || []).find((s) => s.credentialIdBase64 === data.id);

    if (!auth) {
      throw new Error(`Could not find authenticator ${data.id} for user ${user.userId}`);
    }

    const authenticator: AuthenticatorDevice = {
      counter: auth.counter,
      credentialID: Base64Ratchet.base64StringToBuffer(auth.credentialIdBase64),
      credentialPublicKey: Base64Ratchet.base64StringToBuffer(auth.credentialPublicKeyBase64),
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

  public async removeSingleWebAuthnRegistration(userId: string, key: string): Promise<SimpleAuthenticationEntry> {
    let ent: SimpleAuthenticationEntry = await this.storageProvider.readEntryById(userId);
    if (ent) {
      ent.webAuthnAuthenticators = (ent.webAuthnAuthenticators || []).filter((s) => s.credentialIdBase64 !== key);
      ent = await this.storageProvider.saveEntry(ent);
    } else {
      Logger.info('Not removing - no such user as %s', userId);
    }
    return ent;
  }
}

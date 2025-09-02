import { WardenStorageProvider } from "./provider/warden-storage-provider.js";

import { WardenService } from "./warden-service.js";
import { WardenServiceOptions } from "./warden-service-options.js";
import { WardenContactType } from "@bitblit/ratchet-warden-common/common/model/warden-contact-type";
import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { WardenLoginRequest } from "@bitblit/ratchet-warden-common/common/model/warden-login-request";
import { WardenCommand } from "@bitblit/ratchet-warden-common/common/command/warden-command";
import { WardenCommandResponse } from "@bitblit/ratchet-warden-common/common/command/warden-command-response";
import { WardenLoginResults } from "@bitblit/ratchet-warden-common/common/model/warden-login-results";

import { JwtRatchet } from "@bitblit/ratchet-node-only/jwt/jwt-ratchet";

import { WardenUserDecorationProvider } from "./provider/warden-user-decoration-provider.js";
import { WardenSingleUseCodeProvider } from "./provider/warden-single-use-code-provider.js";
import { beforeEach, describe, expect, test } from "vitest";
import { mock, MockProxy } from "vitest-mock-extended";
import { WardenLoginRequestType } from "@bitblit/ratchet-warden-common/common/model/warden-login-request-type";

//let mockJwtRatchet: MockProxy<JwtRatchetLike>;
let mockWardenStorageProvider: MockProxy<WardenStorageProvider>;
let mockWardenSingleUseCodeProvider: MockProxy<WardenSingleUseCodeProvider>;
let mockUserDecorationProvider: MockProxy<WardenUserDecorationProvider<any>>;
let opts: WardenServiceOptions;

describe('#WardenService', () => {
  beforeEach(() => {
    //mockJwtRatchet = mock<JwtRatchetLike>();;
    mockWardenStorageProvider = mock<WardenStorageProvider>();
    mockWardenSingleUseCodeProvider = mock<WardenSingleUseCodeProvider>();
    mockUserDecorationProvider = mock<WardenUserDecorationProvider<string>>();

    opts = {
      // Human-readable title for your website
      relyingPartyName: 'rp',
      allowedOrigins: ['origin'],

      storageProvider: mockWardenStorageProvider,
      singleUseCodeProviders: [mockWardenSingleUseCodeProvider],
      jwtRatchet: new JwtRatchet({ encryptionKeyPromise: Promise.resolve('asdf') }), //mockJwtRatchet,
      userDecorationProvider: mockUserDecorationProvider,
      eventProcessor: undefined,
    };
  });

  test('Should login', async () => {
    const svc: WardenService = new WardenService(opts);

    const loginReq: WardenLoginRequest = {
      type: WardenLoginRequestType.ExpiringToken,
      //userId: string;
      contact: { type: WardenContactType.EmailAddress, value: 'test@test.com' },
      //webAuthn?: AuthenticationResponseJSON;
      expiringToken: '12345',
      //jwtTokenToRefresh?: string;
    };
    const cmd: WardenCommand = {
      performLogin: loginReq,
    };

    const origin: string = 'localhost';
    mockWardenStorageProvider.findEntryByContact.mockResolvedValue({
      userId: '12345',
      userLabel: 'Test User',
      contactMethods: [{ type: WardenContactType.EmailAddress, value: 'test@test.com' }],
      tags: ['test'],
      webAuthnAuthenticators: [],
      thirdPartyAuthenticators: [],
      createdEpochMS: 1234,
      updatedEpochMS: 1235,
    });
    mockUserDecorationProvider.fetchDecoration.mockResolvedValue({
      userTokenData: { a: 'b', c: 1 },
      proxyUserTokenData: null,
      userTokenExpirationSeconds: 3600,
      teamRoleMappings: [{ teamId: 'WARDEN', roleId: 'USER' }],
      globalRoleIds: [],
    });
    mockWardenSingleUseCodeProvider.handlesContactType.mockReturnValue(true);
    mockWardenSingleUseCodeProvider.checkCode.mockResolvedValue(true);

    const out: WardenCommandResponse = await svc.processCommandToResponse(cmd, origin, null);
    const loginResults: WardenLoginResults = out.performLogin;
    //const parsedJwt: any = opts.jwtRatchet.decodeToken(loginResults.jwtToken);

    //Logger.info('LOGIN: %j : JWT: %j', loginResults, parsedJwt);
    expect(out).toBeTruthy();
    expect(loginResults).toBeTruthy();
  });

  // Need to implement
  test('Should create and account', async () => {
    const svc: WardenService = new WardenService(opts);

    mockWardenStorageProvider.findEntryByContact.mockResolvedValue(null);
    mockWardenStorageProvider.saveEntry.mockResolvedValue({ userId: 'test' } as WardenEntry);
    mockWardenSingleUseCodeProvider.handlesContactType.mockReturnValue(true);

    const res: WardenEntry = await svc.createAccount({ type: WardenContactType.EmailAddress, value: 'test@test.com' }, 'testorigin.com',false, 'Test', []);
    expect(res.userId).toEqual('test');
  });
});

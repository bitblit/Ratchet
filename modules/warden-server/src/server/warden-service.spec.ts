import { WardenStorageProvider } from './provider/warden-storage-provider.js';
import { JestRatchet } from '@bitblit/ratchet-jest';
import { WardenService } from './warden-service.js';
import { WardenServiceOptions } from './warden-service-options.js';
import {
  WardenCommand,
  WardenCommandResponse,
  WardenContactType,
  WardenEntry,
  WardenLoginRequest,
  WardenLoginResults,
} from '@bitblit/ratchet-warden-common';
import { JwtRatchet } from '@bitblit/ratchet-common';
import { jest } from '@jest/globals';
import { WardenUserDecorationProvider } from './provider/warden-user-decoration-provider.js';
import { WardenSingleUseCodeProvider } from './provider/warden-single-use-code-provider';

//let mockJwtRatchet: jest.Mocked<JwtRatchetLike>;
let mockWardenStorageProvider: jest.Mocked<WardenStorageProvider>;
let mockWardenSingleUseCodeProvider: jest.Mocked<WardenSingleUseCodeProvider>;
let mockUserDecorationProvider: jest.Mocked<WardenUserDecorationProvider<any>>;
let opts: WardenServiceOptions;

describe('#WardenService', () => {
  beforeEach(() => {
    //mockJwtRatchet = JestRatchet.mock(jest.fn);
    mockWardenStorageProvider = JestRatchet.mock(jest.fn);
    mockWardenSingleUseCodeProvider = JestRatchet.mock(jest.fn);
    mockUserDecorationProvider = JestRatchet.mock(jest.fn);

    opts = {
      // Human-readable title for your website
      relyingPartyName: 'rp',
      allowedOrigins: ['origin'],

      storageProvider: mockWardenStorageProvider,
      singleUseCodeProviders: [mockWardenSingleUseCodeProvider],
      jwtRatchet: new JwtRatchet(Promise.resolve('asdf')), //mockJwtRatchet,
      userDecorationProvider: mockUserDecorationProvider,
      eventProcessor: undefined,
    };
  });

  it('Should login', async () => {
    const svc: WardenService = new WardenService(opts);

    const loginReq: WardenLoginRequest = {
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
      createdEpochMS: 1234,
      updatedEpochMS: 1235,
    });
    mockUserDecorationProvider.fetchDecoration.mockResolvedValue({
      userTokenData: { a: 'b', c: 1 },
      userTokenExpirationSeconds: 3600,
      userTeamRoles: [{ team: 'WARDEN', role: 'USER' }],
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
  it('Should create and account', async () => {
    const svc: WardenService = new WardenService(opts);

    mockWardenStorageProvider.findEntryByContact.mockResolvedValue(null);
    mockWardenStorageProvider.saveEntry.mockResolvedValue({ userId: 'test' } as WardenEntry);
    mockWardenSingleUseCodeProvider.handlesContactType.mockReturnValue(true);

    const res: string = await svc.createAccount({ type: WardenContactType.EmailAddress, value: 'test@test.com' }, false, 'Test', []);
    expect(res).toEqual('test');
  });
});

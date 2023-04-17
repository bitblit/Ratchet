/*
import { WardenStorageProvider } from './provider/warden-storage-provider';
import { JestRatchet } from '@bitblit/ratchet-jest/lib/jest/jest-ratchet.js';
import { WardenService } from './warden-service';
import { WardenServiceOptions } from './warden-service-options';
import { WardenContactType, WardenEntry } from '@bitblit/ratchet-warden-common';
import { WardenMessageSendingProvider } from './provider/warden-message-sending-provider';
import { ExpiringCodeProvider } from '@bitblit/ratchet-aws';
import { JwtRatchetLike } from '@bitblit/ratchet-common/lib/jwt/jwt-ratchet-like';

let mockJwtRatchet: jest.Mocked<JwtRatchetLike>;
let mockWardenStorageProvider: jest.Mocked<WardenStorageProvider>;
let mockExpiringCodeProvider: jest.Mocked<ExpiringCodeProvider>;
let mockWardenEmailSender: jest.Mocked<WardenMessageSendingProvider<any>>;
*/

describe('#WardenService', () => {
  beforeEach(() => {
    /*
    mockJwtRatchet = JestRatchet.mock<JwtRatchetLike>();
    mockWardenStorageProvider = JestRatchet.mock<WardenStorageProvider>();
    mockWardenEmailSender = JestRatchet.mock<WardenMessageSendingProvider<any>>();
    mockExpiringCodeProvider = JestRatchet.mock<ExpiringCodeProvider>();
    
     */
  });

  // CAW 2023-03-12 : Disabling because fighting with Jest in yarn module with ESM...
  xit('Should create account', async () => {
    /*
    const opts: WardenServiceOptions = {
      // Human-readable title for your website
      relyingPartyName: 'rp',
      allowedOrigins: ['origin'],

      storageProvider: mockWardenStorageProvider,
      messageSendingProviders: [mockWardenEmailSender],
      expiringCodeProvider: mockExpiringCodeProvider,
      jwtRatchet: mockJwtRatchet,
      userDecorationProvider: undefined,
      eventProcessor: undefined,
    };

    const svc: WardenService = new WardenService(opts);

    mockWardenStorageProvider.findEntryByContact.mockResolvedValue(null);
    mockWardenStorageProvider.saveEntry.mockResolvedValue({ userId: 'test' } as WardenEntry);
    mockWardenEmailSender.handlesContactType.mockReturnValue(true);

    const res: string = await svc.createAccount({ type: WardenContactType.EmailAddress, value: 'test@test.com' }, false, 'Test', []);
    expect(res).toEqual('test');

     */
  });
});

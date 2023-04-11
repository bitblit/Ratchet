import { JestRatchet } from '@bitblit/ratchet-jest/jest/jest-ratchet.js';
import { WardenClient } from './warden-client.js';
import { jest } from '@jest/globals';
import { WardenCommandExchangeProvider } from './provider/warden-command-exchange-provider.js';
import { WardenClientCurrentLoggedInJwtTokenProvider } from './provider/warden-client-current-logged-in-jwt-token-provider.js';
import { WardenCommand } from '../common/command/warden-command.js';
import { WardenCommandResponse } from '../common/command/warden-command-response.js';

let mockCommandExchangeProvider: jest.Mocked<WardenCommandExchangeProvider>;
let mockLoggedInJwtTokenProvider: jest.Mocked<WardenClientCurrentLoggedInJwtTokenProvider>;

describe('#wardenClient', function () {
  beforeEach(() => {
    mockCommandExchangeProvider = JestRatchet.mock(jest.fn);
    mockLoggedInJwtTokenProvider = JestRatchet.mock(jest.fn);
  });

  it('should instantiate and exchange commands', async () => {
    const wc: WardenClient = new WardenClient(mockCommandExchangeProvider, mockLoggedInJwtTokenProvider);
    expect(wc).not.toBeNull();
    const cmd: WardenCommand = {
      generateWebAuthnAuthenticationChallengeForUserId: 'test',
    };

    mockCommandExchangeProvider.sendCommand.mockResolvedValue('{"generateWebAuthnAuthenticationChallengeForUserId": { "dataAsJson": {} }}');

    const result: WardenCommandResponse = await wc.exchangeCommand(cmd);
    expect(result).not.toBeNull();
    expect(result.generateWebAuthnRegistrationChallengeForLoggedInUser).not.toBeNull();
  });
});

import { WardenClient } from './warden-client.js';

import { WardenCommandExchangeProvider } from './provider/warden-command-exchange-provider.js';
import { WardenClientCurrentLoggedInJwtTokenProvider } from './provider/warden-client-current-logged-in-jwt-token-provider.js';
import { WardenCommand } from '../common/command/warden-command.js';
import { WardenCommandResponse } from '../common/command/warden-command-response.js';
import { expect, test, describe, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

let mockCommandExchangeProvider: MockProxy<WardenCommandExchangeProvider>;
let mockLoggedInJwtTokenProvider: MockProxy<WardenClientCurrentLoggedInJwtTokenProvider>;

describe('#wardenClient', function () {
  beforeEach(() => {
    mockCommandExchangeProvider = mock<WardenCommandExchangeProvider>();
    mockLoggedInJwtTokenProvider = mock<WardenClientCurrentLoggedInJwtTokenProvider>();
  });

  test('should instantiate and exchange commands', async () => {
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

import { WardenUserService } from './warden-user-service.js';
import { WardenUserServiceOptions } from './provider/warden-user-service-options.js';
import { JestRatchet } from '@bitblit/ratchet-jest';
import { WardenClientRecentLoginProvider } from './provider/warden-client-recent-login-provider.js';
import { WardenLoggedInUserProvider } from './provider/warden-logged-in-user-provider.js';
import { WardenClient } from './warden-client.js';
import { WardenUserServiceEventProcessingProvider } from './provider/warden-user-service-event-processing-provider.js';
import { jest } from '@jest/globals';

describe('#wardenUserService', function () {
  // Currently disabled because this seems to hang forever on github actions (2023-03-20)
  it('should instantiate', async () => {
    const wuso: WardenUserServiceOptions<any> = {
      recentLoginProvider: JestRatchet.mock<WardenClientRecentLoginProvider>(jest.fn),
      loggedInUserProvider: JestRatchet.mock<WardenLoggedInUserProvider<any>>(jest.fn),
      wardenClient: JestRatchet.mock<WardenClient>(jest.fn),
      eventProcessor: JestRatchet.mock<WardenUserServiceEventProcessingProvider<any>>(jest.fn),
      loginCheckTimerPingSeconds: 60,
      autoLoginHandlingThresholdSeconds: 60,
      allowAutoRefresh: true,
      applicationName: 'TEST-APP',
    };

    const wus: WardenUserService<any> = new WardenUserService<any>(wuso);
    expect(wus).not.toBeNull();
    wus.cleanShutDown();
  });
});

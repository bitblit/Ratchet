import { WardenUserService } from './warden-user-service.js';
import { WardenUserServiceOptions } from './provider/warden-user-service-options.js';

import { WardenClientRecentLoginProvider } from './provider/warden-client-recent-login-provider.js';
import { WardenLoggedInUserProvider } from './provider/warden-logged-in-user-provider.js';
import { WardenClient } from './warden-client.js';
import { WardenUserServiceEventProcessingProvider } from './provider/warden-user-service-event-processing-provider.js';
import { describe, expect, test } from 'vitest';
import { mock } from 'vitest-mock-extended';

describe('#wardenUserService', function () {
  // Currently disabled because this seems to hang forever on github actions (2023-03-20)
  test('should instantiate', async () => {
    const wuso: WardenUserServiceOptions = {
      recentLoginProvider: mock<WardenClientRecentLoginProvider>(),
      loggedInUserProvider: mock<WardenLoggedInUserProvider>(),
      wardenClient: mock<WardenClient>(),
      eventProcessor: mock<WardenUserServiceEventProcessingProvider>(),
      loginCheckTimerPingSeconds: 60,
      autoLoginHandlingThresholdSeconds: 60,
      allowAutoRefresh: true,
      applicationName: 'TEST-APP',
    };

    const wus: WardenUserService = new WardenUserService(wuso);
    expect(wus).not.toBeNull();
    wus.cleanShutDown();
  });
});

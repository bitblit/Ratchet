import { WardenUserService } from './warden-user-service';
import { WardenUserServiceOptions } from './provider/warden-user-service-options';
import { JestRatchet } from '@bitblit/ratchet-jest';
import { WardenClientRecentLoginProvider } from './provider/warden-client-recent-login-provider';
import { WardenLoggedInUserProvider } from './provider/warden-logged-in-user-provider';
import { WardenClient } from './warden-client';
import { WardenUserServiceEventProcessingProvider } from './provider/warden-user-service-event-processing-provider';

describe('#wardenUserService', function () {
  // Currently disabled because this seems to hang forever on github actions (2023-03-20)
  xit('should instantiate', async () => {
    const wuso: WardenUserServiceOptions<any> = {
      recentLoginProvider: JestRatchet.mock<WardenClientRecentLoginProvider>(),
      loggedInUserProvider: JestRatchet.mock<WardenLoggedInUserProvider<any>>(),
      wardenClient: JestRatchet.mock<WardenClient>(),
      eventProcessor: JestRatchet.mock<WardenUserServiceEventProcessingProvider<any>>(),
      loginCheckTimerPingSeconds: 60,
      autoLoginHandlingThresholdSeconds: 60,
      allowAutoRefresh: true,
    };

    const wus: WardenUserService<any> = new WardenUserService<any>(wuso);
    expect(wus).not.toBeNull();
  });
});

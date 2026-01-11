import { WardenLoggedInUserProvider } from './warden-logged-in-user-provider.js';
import { WardenClient } from '../warden-client.js';
import { WardenUserServiceEventProcessingProvider } from './warden-user-service-event-processing-provider.js';
import { WardenClientRecentLoginProvider } from './warden-client-recent-login-provider.js';

export interface WardenUserServiceOptions<T> {
  recentLoginProvider?: WardenClientRecentLoginProvider;
  loggedInUserProvider: WardenLoggedInUserProvider;
  wardenClient: WardenClient;
  eventProcessor: WardenUserServiceEventProcessingProvider<T>;
  loginCheckTimerPingSeconds?: number;
  autoLoginHandlingThresholdSeconds?: number;
  allowAutoRefresh?: boolean;

  applicationName: string;
  deviceLabelGenerator?: () => string;
}

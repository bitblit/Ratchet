import { WardenStorageProvider } from './provider/warden-storage-provider.js';
import { WardenMessageSendingProvider } from './provider/warden-message-sending-provider.js';
import { ExpiringCodeProvider } from '@bitblit/ratchet-aws';
import { JwtRatchetLike } from '@bitblit/ratchet-common';
import { WardenUserDecorationProvider } from './provider/warden-user-decoration-provider.js';
import { WardenEventProcessingProvider } from './provider/warden-event-processing-provider.js';

export interface WardenServiceOptions {
  // Human-readable title for your website
  relyingPartyName: string;
  allowedOrigins: string[];

  storageProvider: WardenStorageProvider;
  messageSendingProviders: WardenMessageSendingProvider<any>[];
  expiringCodeProvider: ExpiringCodeProvider;
  jwtRatchet: JwtRatchetLike;
  userDecorationProvider?: WardenUserDecorationProvider<any>;
  eventProcessor?: WardenEventProcessingProvider;
}

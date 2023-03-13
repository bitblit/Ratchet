import { WardenStorageProvider } from './provider/warden-storage-provider';
import { WardenMessageSendingProvider } from './provider/warden-message-sending-provider';
import { ExpiringCodeProvider } from '@bitblit/ratchet-aws';
import { JwtRatchetLike } from '@bitblit/ratchet-common';
import { WardenUserDecorationProvider } from './provider/warden-user-decoration-provider';
import { WardenEventProcessingProvider } from './provider/warden-event-processing-provider';

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

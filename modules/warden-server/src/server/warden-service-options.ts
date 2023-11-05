import { WardenStorageProvider } from './provider/warden-storage-provider.js';
import { JwtRatchetLike } from '@bitblit/ratchet-common';
import { WardenUserDecorationProvider } from './provider/warden-user-decoration-provider.js';
import { WardenEventProcessingProvider } from './provider/warden-event-processing-provider.js';
import { WardenSingleUseCodeProvider } from './provider/warden-single-use-code-provider';

export interface WardenServiceOptions {
  // Human-readable title for your website
  relyingPartyName: string;
  allowedOrigins: string[];
  singleUseCodeProviders: WardenSingleUseCodeProvider[];
  storageProvider: WardenStorageProvider;
  jwtRatchet: JwtRatchetLike;
  userDecorationProvider?: WardenUserDecorationProvider<any>;
  eventProcessor?: WardenEventProcessingProvider;
}

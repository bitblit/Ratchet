import { WardenStorageProvider } from './provider/warden-storage-provider.js';
import { JwtRatchetLike } from '@bitblit/ratchet-common/jwt/jwt-ratchet-like';
import { WardenUserDecorationProvider } from './provider/warden-user-decoration-provider.js';
import { WardenEventProcessingProvider } from './provider/warden-event-processing-provider.js';
import { WardenSingleUseCodeProvider } from './provider/warden-single-use-code-provider.js';
import { WardenSendMagicLinkCommandValidator } from './provider/warden-send-magic-link-command-validator.js';

export interface WardenServiceOptions {
  // Human-readable title for your website
  relyingPartyName: string;
  allowedOrigins: string[];
  singleUseCodeProviders: WardenSingleUseCodeProvider[];
  storageProvider: WardenStorageProvider;
  jwtRatchet: JwtRatchetLike;
  userDecorationProvider?: WardenUserDecorationProvider<any>;
  eventProcessor?: WardenEventProcessingProvider;
  sendMagicLinkCommandValidator?: WardenSendMagicLinkCommandValidator;
}

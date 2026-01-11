import { WardenStorageProvider } from './provider/warden-storage-provider.js';
import { JwtRatchetLike } from '@bitblit/ratchet-node-only/jwt/jwt-ratchet-like';
import { WardenEventProcessingProvider } from './provider/warden-event-processing-provider.js';
import { WardenSingleUseCodeProvider } from './provider/warden-single-use-code-provider.js';
import { WardenSendMagicLinkCommandValidator } from './provider/warden-send-magic-link-command-validator.js';
import { WardenThirdPartyAuthenticationProvider } from "./provider/warden-third-party-authentication-provider.js";

export interface WardenServiceOptions {
  // Human-readable title for your website
  relyingPartyName: string;
  allowedOrigins: string[];
  singleUseCodeProviders: WardenSingleUseCodeProvider[];
  storageProvider: WardenStorageProvider;
  jwtRatchet: JwtRatchetLike;
  eventProcessor?: WardenEventProcessingProvider;
  sendMagicLinkCommandValidator?: WardenSendMagicLinkCommandValidator;
  thirdPartyAuthenticationProviders?: WardenThirdPartyAuthenticationProvider[];
}

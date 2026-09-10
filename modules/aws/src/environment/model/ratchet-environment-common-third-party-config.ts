import { RatchetEnvironmentThirdPartyBrevoConfig } from "./third-party/ratchet-environment-third-party-brevo-config.ts";
import {
  RatchetEnvironmentThirdPartyGoogleConfig
} from "./third-party/ratchet-environment-third-party-google-config.ts";
import {
  RatchetEnvironmentThirdPartyShopifyConfig
} from "./third-party/ratchet-environment-third-party-shopify-config.ts";
import {
  RatchetEnvironmentThirdPartyStripeConfig
} from "./third-party/ratchet-environment-third-party-stripe-config.ts";
import {
  RatchetEnvironmentThirdPartyTwilioConfig
} from "./third-party/ratchet-environment-third-party-twilio-config.ts";

export interface RatchetEnvironmentCommonThirdPartyConfig {
  twilio?: RatchetEnvironmentThirdPartyTwilioConfig;
  brevo?: RatchetEnvironmentThirdPartyBrevoConfig;
  stripe?: RatchetEnvironmentThirdPartyStripeConfig;
  googleAuth?: RatchetEnvironmentThirdPartyGoogleConfig;
  shopify?: RatchetEnvironmentThirdPartyShopifyConfig;
}
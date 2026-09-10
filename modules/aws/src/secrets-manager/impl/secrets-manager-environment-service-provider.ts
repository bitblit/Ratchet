import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { EnvironmentServiceProvider } from "../../environment/environment-service-provider.ts";
import { SecretsManagerRatchet } from "../secrets-manager-ratchet.ts";
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class SecretsManagerEnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  private secretsManagerRatchet: SecretsManagerRatchet
  public constructor(
    private cfg: SecretsManagerEnvironmentServiceProviderConfig
  ) {
    RequireRatchet.notNullOrUndefined(cfg);
    RequireRatchet.true(!!cfg.smOverride || !!cfg.region, 'You must set either region or smOverride');
    const client: SecretsManagerClient  = cfg.smOverride || new SecretsManagerClient({ region: cfg.region });
    this.secretsManagerRatchet = new SecretsManagerRatchet(client);
  }

  public async fetchConfig(name: string): Promise<T> {
    Logger.silly('SecretsManagerEnvironmentServiceProvider fetch for %s', name);
    const rval: T = await this.secretsManagerRatchet.fetchAndParseSecret(name);
    return rval;
  }
}


export interface SecretsManagerEnvironmentServiceProviderConfig {
  smOverride?: SecretsManagerClient;
  region?: string;
}

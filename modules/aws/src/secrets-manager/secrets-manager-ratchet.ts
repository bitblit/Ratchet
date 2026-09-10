import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { GetSecretValueCommand, ResourceNotFoundException, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

export class SecretsManagerRatchet {
  constructor(
    private sm: SecretsManagerClient,
  ) {
    RequireRatchet.notNullOrUndefined(this.sm, 'sm');
  }

  public async fetchSecret(secretName: string , defaultValue?: string): Promise<string> {
    Logger.info('Fetching secret %s', secretName);
    let rval: string = null;
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.sm.send(command);

      if (response.SecretString) {
        rval= response.SecretString; // JSON string or plain string
      } else if (response.SecretBinary) {
        // decode from base64 if stored as binary
        const buff = Buffer.from(response.SecretBinary as any, 'base64');
        rval = buff.toString('ascii');
      }
    } catch (err) {
      if (err instanceof ResourceNotFoundException) {
        if (defaultValue!==null && defaultValue !== undefined) {
          rval = defaultValue;
        } else {
          throw new Error('Secret has no value and no default set for ' + secretName, err);
        }
      } else {
        Logger.error('Failed to retrieve secret: %s : %s', secretName,  err, err);
        throw err;
      }
    }
    return rval;
  }

  public async fetchAndParseSecret<T>(secretName: string , defaultValue?: T): Promise<T> {
    Logger.info('Fetching secret %s', secretName);
    const asString: string = await this.fetchSecret(secretName, undefined);
    let rval: T = null;
    if (asString) {
      rval = JSON.parse(asString);
    }
    rval = rval ?? defaultValue;
    if (!rval) {
      throw new Error('Secret has no value and no default set');
    }
    return rval;
  }

}
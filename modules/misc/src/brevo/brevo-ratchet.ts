//    Code to simplify interacting with Brevo (brevo.com)
//import * as brevoApi from '@getbrevo/brevo';
//import { AccountApi, TransactionalEmailsApi } from '@getbrevo/brevo';
import { BrevoKeys } from './brevo-keys';
import { Logger } from '@bitblit/ratchet-common';
import { AccountApi } from './openapi-generated/apis/AccountApi.js';
import { SMTPApi } from './openapi-generated/apis/SMTPApi';
import { Configuration, ConfigurationParameters, FetchParams, Middleware, RequestContext } from './openapi-generated/runtime';
import { GetAccount } from './openapi-generated/models';

export class BrevoRatchet {
  constructor(
    private keys: Promise<BrevoKeys>,
    private configParamTemplate?: ConfigurationParameters,
  ) {}

  private async buildConfig(): Promise<ConfigurationParameters> {
    const keys: BrevoKeys = await this.keys;
    const rval: ConfigurationParameters = this.configParamTemplate ? Object.assign({}, this.configParamTemplate) : {};

    const logger: Middleware = {
      pre: async (context: RequestContext): Promise<FetchParams | void> => {
        Logger.silly('Context: %j', context);
      },
    };

    rval.apiKey = keys.apiKey;
    rval.middleware = [logger];
    return rval;
  }

  public async accountApi(): Promise<AccountApi> {
    const config: ConfigurationParameters = await this.buildConfig();
    const rval: AccountApi = new AccountApi(new Configuration(config));
    return rval;
  }

  public async smtpApi(): Promise<SMTPApi> {
    const config: ConfigurationParameters = await this.buildConfig();
    const rval: SMTPApi = new SMTPApi(new Configuration(config));
    return rval;
  }

  // This is mainly just here to test things
  public async fetchAccountData(): Promise<GetAccount> {
    const api: AccountApi = await this.accountApi();
    const rval: GetAccount = await api.getAccount();
    return rval;
  }
}

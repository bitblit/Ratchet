//    Code to simplify interacting with Brevo (brevo.com)
//import * as brevoApi from '@getbrevo/brevo';
//import { AccountApi, TransactionalEmailsApi } from '@getbrevo/brevo';
import { BrevoKeys } from './brevo-keys.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { AccountApi } from './generated/apis/AccountApi.js';
import { SMTPApi } from './generated/apis/SMTPApi.js';
import { Configuration, ConfigurationParameters, FetchParams, Middleware, RequestContext } from './generated/runtime.js';
import { GetAccount } from './generated/models/GetAccount.js';
import { TransactionalSMSApi } from "./generated/apis/TransactionalSMSApi.ts";

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

  public async transactionalSMSApi(): Promise<TransactionalSMSApi> {
    const config: ConfigurationParameters = await this.buildConfig();
    const rval: TransactionalSMSApi = new TransactionalSMSApi(new Configuration(config));
    return rval;
  }

  // This is mainly just here to test things
  public async fetchAccountData(): Promise<GetAccount> {
    const api: AccountApi = await this.accountApi();
    const rval: GetAccount = await api.getAccount();
    return rval;
  }

}

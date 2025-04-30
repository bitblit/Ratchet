//    Service for sending codes via twilio verify
import { WardenTwilioVerifySingleUseCodeProviderOptions } from './warden-twilio-verify-single-use-code-provider-options.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { WardenSingleUseCodeProvider } from './warden-single-use-code-provider.js';
import { TwilioVerifyRatchet } from '@bitblit/ratchet-common/third-party/twilio/twilio-verify-ratchet';
import { WardenContactType } from '@bitblit/ratchet-warden-common/common/model/warden-contact-type';
import { WardenContact } from '@bitblit/ratchet-warden-common/common/model/warden-contact';

export class WardenTwilioVerifySingleUseCodeProvider implements WardenSingleUseCodeProvider {
  private _cacheTwilioVerifyRatchet: TwilioVerifyRatchet;

  constructor(private optsPromise: Promise<WardenTwilioVerifySingleUseCodeProviderOptions>) {}

  private async twilioVerifyRatchet(): Promise<TwilioVerifyRatchet> {
    if (!this._cacheTwilioVerifyRatchet) {
      const opts: WardenTwilioVerifySingleUseCodeProviderOptions = await this.optsPromise;
      this._cacheTwilioVerifyRatchet = new TwilioVerifyRatchet(opts.accountSID, opts.authToken, opts.verifyServiceSID);
    }
    return this._cacheTwilioVerifyRatchet;
  }

  public handlesContactType(type: WardenContactType): boolean {
    return type === WardenContactType.TextCapablePhoneNumber;
  }

  public async createAndSendNewCode(contact: WardenContact, _relyingPartyNameIgnored: string, _origin: string): Promise<boolean> {
    // Twilio verify does not let you set the message
    const ratchet: TwilioVerifyRatchet = await this.twilioVerifyRatchet();
    const rval: any = await ratchet.sendVerificationTokenUsingTwilioVerify(contact.value);
    Logger.debug('sendMessage was : %j', rval);
    return !!rval;
  }
  public async checkCode(contactValue: string, code: string): Promise<boolean> {
    const ratchet: TwilioVerifyRatchet = await this.twilioVerifyRatchet();
    const rval: boolean = await ratchet.simpleCheckVerificationTokenUsingTwilioVerify(contactValue, code);
    return rval;
  }
}

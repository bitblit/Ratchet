import fetch from 'cross-fetch';

import { RequireRatchet } from '../../lang/require-ratchet.js';
import { Logger } from '../../logger/logger.js';
import { TwilioRatchet } from './twilio-ratchet.js';

/**
 * This is for JUST hitting the Twilio verify service (useful for 2FA/One time passwords) without
 * needing a phone number
 */
export class TwilioVerifyRatchet {
  public static readonly TWILLIO_BASE_VERIFY_URL: string = 'https://verify.twilio.com/v2/Services/';

  constructor(
    private accountSid: string,
    private authToken: string,
    private serviceSid: string,
  ) {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(accountSid, 'accountSid');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(authToken, 'authToken');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(serviceSid, 'serviceSid');
  }

  public async sendVerificationTokenUsingTwilioVerify(recipientPhoneNumber: string): Promise<string> {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(recipientPhoneNumber, 'recipientPhoneNumber');
    RequireRatchet.true(TwilioRatchet.isValidE164Number(recipientPhoneNumber), 'recipientPhoneNumber must be E164');
    const phone: string = recipientPhoneNumber.startsWith('+1') ? recipientPhoneNumber : '+1' + recipientPhoneNumber;
    const body: string = 'Channel=sms&To=' + encodeURIComponent(phone);
    const post: any = {
      method: 'post',
      headers: {
        authorization: TwilioRatchet.generateTwilioBasicAuth(this.accountSid, this.authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    };

    const url: string = TwilioVerifyRatchet.TWILLIO_BASE_VERIFY_URL + this.serviceSid + '/Verifications';
    const res: Response = await fetch(url, post);
    const respBody: string = await res.text();
    return respBody;
  }

  public async simpleCheckVerificationTokenUsingTwilioVerify(recipientPhoneNumber: string, code: string): Promise<boolean> {
    const val: TwilioVerifyCheckResponse = await this.checkVerificationTokenUsingTwilioVerify(recipientPhoneNumber, code);
    return val && val.status === 'approved';
  }

  public async checkVerificationTokenUsingTwilioVerify(recipientPhoneNumber: string, code: string): Promise<TwilioVerifyCheckResponse> {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(recipientPhoneNumber, 'recipientPhoneNumber');
    RequireRatchet.true(TwilioRatchet.isValidE164Number(recipientPhoneNumber), 'recipientPhoneNumber must be E164');
    const phone: string = recipientPhoneNumber.startsWith('+1') ? recipientPhoneNumber : '+1' + recipientPhoneNumber;
    const body: string = 'To=' + encodeURIComponent(phone) + '&Code=' + encodeURIComponent(code);
    const post: any = {
      method: 'post',
      headers: {
        authorization: TwilioRatchet.generateTwilioBasicAuth(this.accountSid, this.authToken),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    };

    const url: string = TwilioVerifyRatchet.TWILLIO_BASE_VERIFY_URL + this.serviceSid + '/VerificationCheck';
    Logger.info('Using %s / %j', url, post);
    const res: Response = await fetch(url, post);
    const parsedResponse: TwilioVerifyCheckResponse = await res.json();
    return parsedResponse;
  }
}

export interface TwilioVerifyCheckResponse {
  status: string;
  payee: string;
  date_updated: string;
  account_sid: string;
  to: string;
  amount: string;
  valid: boolean;
  sid: string;
  date_created: string;
  service_sid: string;
  channel: string;
}

import fetch from 'cross-fetch';

import { RequireRatchet } from './require-ratchet';
import { Base64Ratchet } from './base64-ratchet';
import { StringRatchet } from './string-ratchet';
import { Logger } from './logger';

/**
 * This class is for people who just need to send an occasionaly outbound text message and don't need
 * Twilio's 7mb non-tree-shakable library
 */
export class TwilioRatchet {
  // CAW: Switch to api.ashburn to us just us-east-1 ?
  public static readonly TWILLIO_BASE_API_URL: string = 'https://api.twilio.com/2010-04-01';

  constructor(
    private accountSid: string,
    private authToken: string,
    private outBoundNumber: string,
  ) {
    RequireRatchet.notNullOrUndefined(accountSid, 'accountSid');
    RequireRatchet.notNullOrUndefined(authToken, 'authToken');
    RequireRatchet.notNullOrUndefined(outBoundNumber, 'outBoundNumber');
    RequireRatchet.true(TwilioRatchet.isValidE164Number(outBoundNumber), 'outBoundNumber invalid format');
  }

  // Pass thru for simplification
  public static async sendMessageDirect(
    accountSid: string,
    authToken: string,
    outBoundNumber: string,
    recipientPhoneNumbers: string[],
    message: string,
  ): Promise<any[]> {
    const ratchet: TwilioRatchet = new TwilioRatchet(accountSid, authToken, outBoundNumber);
    const rval: any[] = await ratchet.sendMessage(recipientPhoneNumbers, message);
    return rval;
  }

  public static generateTwilioBasicAuth(sid: string, authToken: string): string {
    const authHeader: string = 'Basic ' + Base64Ratchet.generateBase64VersionOfString(sid + ':' + authToken);
    return authHeader;
  }

  public async sendMessage(recipientPhoneNumbers: string[], message: string): Promise<any[]> {
    const rval: any[] = [];
    RequireRatchet.notNullOrUndefined(recipientPhoneNumbers, 'recipientPhoneNumbers');
    RequireRatchet.notNullOrUndefined(StringRatchet.trimToNull(message), 'message');
    RequireRatchet.true(recipientPhoneNumbers.length > 0, 'recipientPhoneNumbers non-empty');
    recipientPhoneNumbers.forEach((p) => {
      RequireRatchet.true(TwilioRatchet.isValidE164Number(p), p + ' is not valid');
    });

    if (!!recipientPhoneNumbers && recipientPhoneNumbers.length > 0 && !!StringRatchet.trimToNull(message)) {
      Logger.info('Sending %s to %j', message, recipientPhoneNumbers);

      for (let i = 0; i < recipientPhoneNumbers.length; i++) {
        const phoneNumber: string = recipientPhoneNumbers[i];
        Logger.info('To: %s', phoneNumber);

        if (!TwilioRatchet.isValidE164Number(phoneNumber)) {
          throw new Error('number must be E164 format!');
        }
        const body: string =
          'Body=' +
          encodeURIComponent(message) +
          '&From=' +
          encodeURIComponent(this.outBoundNumber) +
          '&To=' +
          encodeURIComponent(phoneNumber);
        const post: any = {
          method: 'post',
          headers: {
            authorization: TwilioRatchet.generateTwilioBasicAuth(this.accountSid, this.authToken),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body,
        };

        const res: Response = await fetch(TwilioRatchet.TWILLIO_BASE_API_URL + '/Accounts/' + this.accountSid + '/Messages.json', post);
        const parsedResponse: any = await res.json();
        Logger.debug('TwilioRatchet: For %s got %j', phoneNumber, parsedResponse);
        rval.push(parsedResponse);
      }
    } else {
      Logger.warn('Not sending empty message / empty recipients');
    }

    return rval;
  }

  // Validate E164 format
  public static isValidE164Number(num: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(num);
  }
}

//    Service for interacting with positions for a given user
import { WardenMessageSendingProvider } from './warden-message-sending-provider.js';
import { WardenTwilioTextMessageSendingProviderOptions } from './warden-twilio-text-message-sending-provider-options.js';

import { Logger } from '@bitblit/ratchet-common';
import { TwilioRatchet } from '@bitblit/ratchet-common';
import { WardenContact } from '@bitblit/ratchet-warden-common';
import { WardenCustomerMessageType } from '@bitblit/ratchet-warden-common';
import { WardenContactType } from '@bitblit/ratchet-warden-common';

export class WardenTwilioTextMessageSendingProvider implements WardenMessageSendingProvider<string> {
  constructor(private optsPromise: Promise<WardenTwilioTextMessageSendingProviderOptions>) {}

  public async formatMessage(
    contact: WardenContact,
    messageType: WardenCustomerMessageType,
    context: Record<string, any>
  ): Promise<string> {
    Logger.info('Creating text');
    // https://www.macrumors.com/2020/01/31/apple-standardized-format-sms-one-time-passcodes/
    const msg: string =
      context['code'] +
      ' is your ' +
      context['relyingPartyName'] +
      ' authentication code.\n@' +
      context['relyingPartyName'] + // should be domain name?
      ' #' +
      context['code'];
    return msg;
  }

  handlesContactType(type: WardenContactType): boolean {
    return type === WardenContactType.TextCapablePhoneNumber;
  }

  public async sendMessage(contact: WardenContact, message: string): Promise<boolean> {
    const opts: WardenTwilioTextMessageSendingProviderOptions = await this.optsPromise;
    const rval: any[] = await TwilioRatchet.sendMessageDirect(
      opts.accountSID,
      opts.authToken,
      opts.outBoundNumber,
      [contact.value],
      message
    );
    Logger.debug('sendMessage was : %j', rval);
    return !!rval && rval.length > 0;
  }
}

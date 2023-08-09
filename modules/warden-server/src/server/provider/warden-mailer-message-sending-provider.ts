//    Service for interacting with positions for a given user
import { WardenMessageSendingProvider } from './warden-message-sending-provider.js';
import { WardenMailerMessageSendingProviderOptions } from './warden-mailer-message-sending-provider-options.js';
import { SendRawEmailResponse } from '@aws-sdk/client-ses';
import { MailerLike } from '@bitblit/ratchet-aws';
import { ReadyToSendEmail } from '@bitblit/ratchet-aws';

import { ErrorRatchet, Logger } from '@bitblit/ratchet-common';
import { WardenContact } from '@bitblit/ratchet-warden-common';
import { WardenContactType } from '@bitblit/ratchet-warden-common';
import { WardenCustomerMessageType } from '@bitblit/ratchet-warden-common';

export class WardenMailerMessageSendingProvider implements WardenMessageSendingProvider<ReadyToSendEmail> {
  private static defaultOptions(): WardenMailerMessageSendingProviderOptions {
    const rval: WardenMailerMessageSendingProviderOptions = {
      emailBaseLayoutName: undefined,
      expiringTokenHtmlTemplateName: 'expiring-token-request-email',
      expiringTokenTxtTemplateName: undefined,
      magicLinkHtmlTemplateName: 'magic-token-request-email',
      magicLinkTxtTemplateName: undefined,
    };
    return rval;
  }

  constructor(
    private mailer: MailerLike,
    private options: WardenMailerMessageSendingProviderOptions = WardenMailerMessageSendingProvider.defaultOptions(),
  ) {}

  public async formatMessage(
    contact: WardenContact,
    messageType: WardenCustomerMessageType,
    context: Record<string, any>,
  ): Promise<ReadyToSendEmail> {
    const rts: ReadyToSendEmail = {
      destinationAddresses: [contact.value],
      subject: 'Your login token',
    };

    if (messageType === WardenCustomerMessageType.ExpiringCode) {
      await this.mailer.fillEmailBody(
        rts,
        context,
        this.options.expiringTokenHtmlTemplateName,
        this.options.expiringTokenTxtTemplateName,
        this.options.emailBaseLayoutName,
      );
    } else if (messageType === WardenCustomerMessageType.MagicLink) {
      await this.mailer.fillEmailBody(
        rts,
        context,
        this.options.magicLinkHtmlTemplateName,
        this.options.magicLinkTxtTemplateName,
        this.options.emailBaseLayoutName,
      );
    } else {
      throw ErrorRatchet.fErr('No such message type : %s', messageType);
    }

    return rts;
  }

  handlesContactType(type: WardenContactType): boolean {
    return type === WardenContactType.EmailAddress;
  }

  public async sendMessage(contact: WardenContact, message: ReadyToSendEmail): Promise<boolean> {
    const rval: SendRawEmailResponse = await this.mailer.sendEmail(message);
    Logger.debug('SendRawEmailResponse was : %j', rval);
    return !!rval;
  }
}

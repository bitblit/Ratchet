import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email.js';
import { Logger } from '../logger/logger.js';
import { ErrorRatchet } from '../lang/error-ratchet.js';
import { MailSendingProvider } from './mail-sending-provider.js';

/**
 * An implementation of mail sending provider to simplify testing
 */
export class TestMailSendingProvider implements MailSendingProvider<string, string> {
  constructor(public failEmails: string[] = []) {}
  public async sendEmail(mail: ResolvedReadyToSendEmail): Promise<string> {
    Logger.info('Called send email : %j', mail);
    if (this.failEmails) {
      this.failEmails.forEach((fe) => {
        if (mail?.destinationAddresses?.includes(fe)) {
          throw ErrorRatchet.fErr('Forced-fail email address: %s', fe);
        }
      });
    }

    return 'OK';
  }
  public async archiveEmail(mail: ResolvedReadyToSendEmail): Promise<string> {
    Logger.info('Called archive email : %j', mail);
    if (this.failEmails) {
      this.failEmails.forEach((fe) => {
        if (mail?.destinationAddresses?.includes(fe)) {
          throw ErrorRatchet.fErr('Forced-fail email address: %s', fe);
        }
      });
    }

    return 'OK';
  }
}

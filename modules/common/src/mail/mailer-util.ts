import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email.js';
import { RequireRatchet } from '../lang/require-ratchet';
import { StringRatchet } from '../lang/string-ratchet';

/**
 * Helper functions for the mailer, most notably the one that converts it to raw
 * SMTP
 */
export class MailerUtil {
  public static readonly EMAIL: RegExp = new RegExp('.+@.+\\.[a-z]+');

  constructor() {}

  public static convertResolvedReadyToSendEmailToRaw(rts: ResolvedReadyToSendEmail): string {
    RequireRatchet.notNullOrUndefined(rts, 'RTS must be defined');
    RequireRatchet.notNullOrUndefined(rts.destinationAddresses, 'Destination addresses must be defined');

    const toLine: string = 'To: ' + rts.destinationAddresses.join(', ') + '\n';
    const bccLine: string = !!rts.bccAddresses && rts.bccAddresses.length > 0 ? 'Bcc: ' + rts.bccAddresses.join(', ') + '\n' : '';

    const from: string = rts.fromAddress;
    const boundary: string = 'NextPart';
    const altBoundary: string = 'AltPart';
    let rawMail: string = 'From: ' + from + '\n';
    rawMail += toLine;
    rawMail += bccLine;
    rawMail += 'Subject: ' + rts.subject + '\n';
    rawMail += 'MIME-Version: 1.0\n';
    rawMail += 'Content-Type: multipart/mixed; boundary="' + boundary + '"\n';

    rawMail += '\n\n--' + boundary + '\n';
    rawMail += 'Content-Type: multipart/alternative; boundary="' + altBoundary + '"\n';
    if (!!StringRatchet.trimToNull(rts.htmlMessage)) {
      rawMail += '\n\n--' + altBoundary + '\n';
      rawMail += 'Content-Type: text/html; charset="UTF-8"\n\n';
      rawMail += rts.htmlMessage;
    }
    if (!!StringRatchet.trimToNull(rts.txtMessage)) {
      rawMail += '\n\n--' + altBoundary + '\n';
      rawMail += 'Content-Type: text/plain\n\n';
      rawMail += rts.txtMessage;
    }

    rawMail += '\n\n--' + altBoundary + '--\n';

    if (rts.attachments) {
      rts.attachments.forEach((a) => {
        rawMail += '\n\n--' + boundary + '\n';
        rawMail += 'Content-Type: ' + a.contentType + '; name="' + a.filename + '"\n';
        rawMail += 'Content-Transfer-Encoding: base64\n';
        rawMail += 'Content-Disposition: attachment\n\n';
        rawMail += a.base64Data.replace(/([^\0]{76})/g, '$1\n') + '\n\n';
      });
    }
    rawMail += '\n\n--' + boundary + '--\n';

    return rawMail;
  }

  public static validEmail(email: string): boolean {
    return email !== null && MailerUtil.EMAIL.test(email);
  }
}

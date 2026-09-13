// Bridge from the BrevoRatchet to the implementation needed by mailer

import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { BrevoRatchet } from './brevo-ratchet.js';
import { SMTPApi } from './generated/apis/SMTPApi.js';
import { CreateSmtpEmail } from './generated/models/CreateSmtpEmail.js';
import { SendSmtpEmail } from './generated/models/SendSmtpEmail.js';
import { MailSendingProvider } from '@bitblit/ratchet-common/mail/mail-sending-provider';
import { ResolvedReadyToSendEmail } from '@bitblit/ratchet-common/mail/resolved-ready-to-send-email';
import { SendSmtpEmailAttachmentInner } from "brevo/generated/models";

export class BrevoMailSendingProvider implements MailSendingProvider<CreateSmtpEmail, string> {
  constructor(private brevo: BrevoRatchet) {}

  public async sendEmail(rts: ResolvedReadyToSendEmail): Promise<CreateSmtpEmail> {
    try {
      const api: SMTPApi = await this.brevo.smtpApi();

      const sendSmtpEmail: SendSmtpEmail = {
        subject: rts.subject,
        htmlContent: rts.htmlMessage,
        sender: { name: rts.fromName, email: rts.fromAddress || 'a@a.com' },
        to: (rts.destinationAddresses || []).map((s) => {
          return { email: s };
        }),
        //sendSmtpEmail.cc = rts..map(s=>{return {email: s};}[{ email: 'example2@example2.com', name: 'Janice Doe' }];
        bcc: rts?.bccAddresses?.length
          ? rts.bccAddresses.map((s) => {
              return { email: s };
            })
          : undefined,
      };

      if (rts?.attachments?.length) {
        sendSmtpEmail.attachment = rts.attachments.map(ra=>{
          const next: SendSmtpEmailAttachmentInner = {
            content: ra.base64Data,
            name: ra.filename
          };
          return next;
        });
      }


      //sendSmtpEmail.replyTo = { email: 'replyto@domain.com', name: 'John Doe' };
      //sendSmtpEmail.headers = { 'Some-Custom-Name': 'unique-id-1234' };
      //sendSmtpEmail.params = { parameter: 'My param value', subject: 'New Subject' };

      const output: CreateSmtpEmail = await api.sendTransacEmail({ sendSmtpEmail: sendSmtpEmail });
      return output;
    } catch (err) {
      Logger.error('Failed to send email: %s', err, err);
      throw err;
    }
  }
}

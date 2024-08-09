// Bridge from the BrevoRatchet to the implementation needed by mailer

import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { BrevoRatchet } from "./brevo-ratchet.js";
import { SMTPApi } from "./generated/apis/SMTPApi.js";
import { CreateSmtpEmail, SendSmtpEmail } from "./generated/models.js";
import { MailSendingProvider } from "@bitblit/ratchet-common/mail/mail-sending-provider";
import { ResolvedReadyToSendEmail } from "@bitblit/ratchet-common/mail/resolved-ready-to-send-email";

export class BrevoMailSendingProvider implements MailSendingProvider<CreateSmtpEmail, string> {
  constructor(private brevo: BrevoRatchet) {}

  public async sendEmail(rts: ResolvedReadyToSendEmail): Promise<CreateSmtpEmail> {
    try {
      const api: SMTPApi = await this.brevo.smtpApi();

      if (rts?.attachments?.length) {
        throw ErrorRatchet.fErr('Cannot send email with attachments yet, not supported');
      }

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

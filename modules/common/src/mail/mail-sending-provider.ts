import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email.js';

/**
 * Generic Mail Sender.
 *
 * If the provider needs the raw text version, it can call the function in MailerUtil to convert it.
 * If it provides an archive function, it will be called
 *
 * for AWS.
 *
 * Params:
 * ses: AWS SES handler, properly configured
 * defaultSendingAddress:
 *
 * T is the object returned by the Mail sender when you send an email
 * R is the object returned by the Mail archiver when you archive an email
 */
export interface MailSendingProvider<T, R> {
  sendEmail(mail: ResolvedReadyToSendEmail): Promise<T>;
  archiveEmail?(mail: ResolvedReadyToSendEmail, rawSendResult: T): Promise<R>;
}

import { ReadyToSendEmail } from './ready-to-send-email.js';
import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email.js';
import { SendEmailResult } from './send-email-result';

/**
 * Generic Mail Sender for AWS.
 *
 * Params:
 * ses: AWS SES handler, properly configured
 * defaultSendingAddress:
 */
export interface MailerLike<T, R> {
  fillEmailBody(
    rts: ReadyToSendEmail,
    context: any,
    htmlTemplateName: string,
    txtTemplateName?: string,
    layoutName?: string,
    partialNames?: string[],
  ): Promise<ReadyToSendEmail>;

  fillEmailBodyAndSend(
    rts: ReadyToSendEmail,
    context: any,
    htmlTemplateName: string,
    txtTemplateName?: string,
    layoutName?: string,
    partialNames?: string[],
  ): Promise<SendEmailResult<T, R>>;

  filterEmailsToValid(emails: string[]): string[];

  applyLimitsToBodySizesIfAnyInPlace(rts: ResolvedReadyToSendEmail): void;

  applyLimitsToAttachmentSizesIfAnyInPlace(rts: ResolvedReadyToSendEmail): void;

  sendEmail(inRts: ReadyToSendEmail): Promise<SendEmailResult<T, R>>;
}

import { ReadyToSendEmail } from './ready-to-send-email';
import { SendRawEmailResponse } from '@aws-sdk/client-ses';
import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email';

/**
 * Generic Mail Sender for AWS.
 *
 * Params:
 * ses: AWS SES handler, properly configured
 * defaultSendingAddress:
 */
export interface MailerLike {
  fillEmailBody(
    rts: ReadyToSendEmail,
    context: any,
    htmlTemplateName: string,
    txtTemplateName?: string,
    layoutName?: string,
    partialNames?: string[]
  ): Promise<ReadyToSendEmail>;

  fillEmailBodyAndSend(
    rts: ReadyToSendEmail,
    context: any,
    htmlTemplateName: string,
    txtTemplateName?: string,
    layoutName?: string,
    partialNames?: string[]
  ): Promise<SendRawEmailResponse>;

  filterEmailsToValid(emails: string[]): string[];

  applyLimitsToBodySizesIfAnyInPlace(rts: ResolvedReadyToSendEmail): void;

  applyLimitsToAttachmentSizesIfAnyInPlace(rts: ResolvedReadyToSendEmail): void;

  sendEmail(inRts: ReadyToSendEmail): Promise<SendRawEmailResponse>;
}

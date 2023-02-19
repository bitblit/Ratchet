import AWS from 'aws-sdk';
import { ReadyToSendEmail } from './ready-to-send-email';
import { RequireRatchet } from '../../common/require-ratchet';
import { Logger } from '../../common/logger';
import { SendRawEmailRequest, SendRawEmailResponse } from 'aws-sdk/clients/ses';
import { StringRatchet } from '../../common/string-ratchet';
import { MailerConfig } from './mailer-config';
import { ErrorRatchet } from '../../common/error-ratchet';
import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email';
import { EmailAttachment } from './email-attachment';
import { DateTime } from 'luxon';
import { Base64Ratchet } from '../../common/base64-ratchet';

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

import { ReadyToSendEmail } from './ready-to-send-email.js';
import { MailerConfig } from './mailer-config.js';
import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email.js';
import { EmailAttachment } from './email-attachment.js';
import { MailerLike } from './mailer-like.js';
import { RequireRatchet } from '../lang/require-ratchet';
import { ErrorRatchet } from '../lang/error-ratchet';
import { Logger } from '../logger/logger';
import { StringRatchet } from '../lang/string-ratchet';
import { Base64Ratchet } from '../lang/base64-ratchet';
import { SendEmailResult } from './send-email-result';
import { ArchiveEmailResult } from './archive-email-result';

/**
 * Generic Mail Sender
 *
 * Params:
 * ses: AWS SES handler, properly configured
 * defaultSendingAddress:
 */
export class Mailer<T, R> implements MailerLike<T, R> {
  constructor(private config: MailerConfig<T, R>) {
    RequireRatchet.notNullOrUndefined(config, 'config');
    RequireRatchet.notNullOrUndefined(config.provider, 'config.provider');
  }

  public async fillEmailBody(
    rts: ReadyToSendEmail,
    context: any,
    htmlTemplateName: string,
    txtTemplateName: string = null,
    layoutName: string = null,
    partialNames: string[] = null,
  ): Promise<ReadyToSendEmail> {
    RequireRatchet.notNullOrUndefined(htmlTemplateName);
    if (!this.config.templateRenderer) {
      ErrorRatchet.throwFormattedErr('Cannot use fill body if template renderer not set');
    }
    rts.htmlMessage = await this.config.templateRenderer.renderTemplate(htmlTemplateName, context, layoutName, partialNames);
    rts.txtMessage = !!txtTemplateName ? await this.config.templateRenderer.renderTemplate(txtTemplateName, context) : null;
    return rts;
  }

  public async fillEmailBodyAndSend(
    rts: ReadyToSendEmail,
    context: any,
    htmlTemplateName: string,
    txtTemplateName: string = null,
    layoutName: string = null,
    partialNames: string[] = null,
  ): Promise<SendEmailResult<T, R>> {
    const newVal: ReadyToSendEmail = await this.fillEmailBody(rts, context, htmlTemplateName, txtTemplateName, layoutName, partialNames);
    const rval: SendEmailResult<T, R> = await this.sendEmail(newVal);
    return rval;
  }

  public filterEmailsToValid(emails: string[]): string[] {
    const rval: string[] = (emails || []).filter((e) => {
      if (!this.config.allowedDestinationEmails || this.config.allowedDestinationEmails.length == 0) {
        return true;
      } else {
        const match: RegExp = this.config.allowedDestinationEmails.find((s) => s.test(e));
        return !!match;
      }
    });
    return rval;
  }

  private async archiveEmailIfConfigured(rts: ResolvedReadyToSendEmail, rawSendResult: T): Promise<ArchiveEmailResult<R>> {
    let rval: ArchiveEmailResult<R> = null;
    if (!!rts && !!this.config.provider.archiveEmail && !rts.doNotArchive) {
      Logger.debug('Archiving outbound email to : %j', rts.destinationAddresses);
      try {
        const raw: R = await this.config.provider.archiveEmail(rts, rawSendResult);
        rval = {
          raw: raw,
          error: null,
          meta: {},
        };
      } catch (err) {
        Logger.warn('Failed to archive email %j : %s', rts, err);
        rval = {
          raw: null,
          error: ErrorRatchet.safeStringifyErr(err),
          meta: {},
        };
      }
    }
    return rval;
  }

  public applyLimitsToBodySizesIfAnyInPlace(rts: ResolvedReadyToSendEmail): void {
    if (this.config.maxMessageBodySizeInBytes) {
      const txtSize: number = StringRatchet.trimToEmpty(rts.txtMessage).length;
      const htmlSize: number = StringRatchet.trimToEmpty(rts.htmlMessage).length;
      const totalSize: number = txtSize + htmlSize;
      if (totalSize > this.config.maxMessageBodySizeInBytes) {
        Logger.warn('Max message size is %d but size is %d - converting', this.config.maxMessageBodySizeInBytes, totalSize);
        rts.attachments = rts.attachments || [];
        if (StringRatchet.trimToNull(rts.txtMessage)) {
          const txtAttach: EmailAttachment = {
            filename: 'original-txt-body.txt',
            contentType: 'text/plain',
            base64Data: Base64Ratchet.generateBase64VersionOfString(rts.txtMessage),
          };
          rts.attachments.push(txtAttach);
        }
        if (StringRatchet.trimToNull(rts.htmlMessage)) {
          const htmlAttach: EmailAttachment = {
            filename: 'original-html-body.html',
            contentType: 'text/html',
            base64Data: Base64Ratchet.generateBase64VersionOfString(rts.htmlMessage),
          };
          rts.attachments.push(htmlAttach);
        }
        rts.htmlMessage = null;
        rts.txtMessage = 'The message was too large and was converted to attachment(s).  Please see attached files for content';
      }
    }
  }

  public applyLimitsToAttachmentSizesIfAnyInPlace(rts: ResolvedReadyToSendEmail): void {
    if (this.config.maxAttachmentSizeInBase64Bytes) {
      const filtered: EmailAttachment[] = [];
      if (rts.attachments) {
        rts.attachments.forEach((a) => {
          if (a.base64Data && a.base64Data.length < this.config.maxAttachmentSizeInBase64Bytes) {
            filtered.push(a);
          } else {
            Logger.warn('Removing too-large attachment : %s : %s : %d', a.filename, a.contentType, a.base64Data.length);
            filtered.push({
              filename: 'attachment-removed-notice-' + StringRatchet.createRandomHexString(4) + '.txt',
              contentType: 'text/plain',
              base64Data: Base64Ratchet.generateBase64VersionOfString(
                'Attachment ' +
                  a.filename +
                  ' of type ' +
                  a.contentType +
                  ' was removed since it was ' +
                  a.base64Data.length +
                  ' bytes but max allowed is ' +
                  this.config.maxAttachmentSizeInBase64Bytes,
              ),
            });
          }
        });
      }
      rts.attachments = filtered;
    }
  }

  public async sendEmail(inRts: ReadyToSendEmail): Promise<SendEmailResult<T, R>> {
    RequireRatchet.notNullOrUndefined(inRts, 'RTS must be defined');
    RequireRatchet.notNullOrUndefined(inRts.destinationAddresses, 'Destination addresses must be defined');
    let rval: SendEmailResult<T, R> = null;

    const resolved: ResolvedReadyToSendEmail = await this.resolveReadyToSendEmail(inRts);
    try {
      const raw: T = await this.config.provider.sendEmail(resolved);
      const archiveResult: ArchiveEmailResult<R> = await this.archiveEmailIfConfigured(resolved, raw);
      rval = {
        request: inRts,
        resolved: resolved,
        success: true,
        rawResult: raw,
        error: null,
        meta: {},
        archiveResults: archiveResult,
      };
    } catch (err) {
      rval = {
        request: inRts,
        resolved: resolved,
        success: false,
        rawResult: null,
        error: ErrorRatchet.safeStringifyErr(err),
        meta: {},
        archiveResults: null,
      };
    }

    return rval;
  }

  public async resolveReadyToSendEmail(inRts: ReadyToSendEmail): Promise<ResolvedReadyToSendEmail> {
    RequireRatchet.notNullOrUndefined(inRts, 'RTS must be defined');
    RequireRatchet.notNullOrUndefined(inRts.destinationAddresses, 'Destination addresses must be defined');

    let toAddresses: string[] = this.filterEmailsToValid(inRts.destinationAddresses);
    const autoBcc: string[] = inRts.doNotAutoBcc ? [] : this.config.autoBccAddresses || [];
    const bccAddresses: string[] = (inRts.bccAddresses || []).concat(autoBcc);
    if (toAddresses.length === 0 && bccAddresses.length > 0) {
      Logger.debug('Destination emails filtered to none but BCC defined, copying BCC');
      toAddresses = bccAddresses;
    }

    const rts: ResolvedReadyToSendEmail = Object.assign({}, inRts);
    rts.srcDestinationAddresses = inRts.destinationAddresses;
    rts.srcBccAddresses = inRts.bccAddresses;
    rts.destinationAddresses = toAddresses;
    rts.bccAddresses = bccAddresses;

    this.applyLimitsToBodySizesIfAnyInPlace(rts);
    this.applyLimitsToAttachmentSizesIfAnyInPlace(rts);

    if (rts.destinationAddresses.length === 0) {
      Logger.info('After cleaning email lists, no destination addresses left - not sending email');
    }

    rts.fromAddress = rts.fromAddress || this.config.defaultSendingAddress;

    return rts;
  }
}

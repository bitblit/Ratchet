import { ReadyToSendEmail } from './ready-to-send-email.js';
import { ErrorRatchet } from '@bitblit/ratchet-common/lang/error-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger.js';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet.js';
import { Base64Ratchet } from '@bitblit/ratchet-common/lang/base64-ratchet.js';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet.js';
import { SendRawEmailCommand, SendRawEmailCommandOutput, SendRawEmailRequest, SendRawEmailResponse, SESClient } from '@aws-sdk/client-ses';
import { MailerConfig } from './mailer-config.js';
import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email.js';
import { EmailAttachment } from './email-attachment.js';
import { DateTime } from 'luxon';
import { MailerLike } from './mailer-like.js';

/**
 * Generic Mail Sender for AWS.
 *
 * Params:
 * ses: AWS SES handler, properly configured
 * defaultSendingAddress:
 */
export class Mailer implements MailerLike {
  public static readonly EMAIL: RegExp = new RegExp('.+@.+\\.[a-z]+');

  constructor(private ses: SESClient, private config: MailerConfig = {} as MailerConfig) {
    RequireRatchet.notNullOrUndefined(this.ses);
    if (!!config.archive && !config.archive.getDefaultBucket()) {
      throw new Error('If archive specified, must set a default bucket');
    }
  }

  public async fillEmailBody(
    rts: ReadyToSendEmail,
    context: any,
    htmlTemplateName: string,
    txtTemplateName: string = null,
    layoutName: string = null,
    partialNames: string[] = null
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
    partialNames: string[] = null
  ): Promise<SendRawEmailResponse> {
    const newVal: ReadyToSendEmail = await this.fillEmailBody(rts, context, htmlTemplateName, txtTemplateName, layoutName, partialNames);
    const rval: SendRawEmailResponse = await this.sendEmail(newVal);
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

  private async archiveEmailIfConfigured(rts: ResolvedReadyToSendEmail): Promise<boolean> {
    let rval: boolean = false;
    if (!!rts && !!this.config.archive && !rts.doNotArchive) {
      Logger.debug('Archiving outbound email to : %j', rts.destinationAddresses);
      let targetPath: string = StringRatchet.trimToEmpty(this.config.archivePrefix);
      if (!targetPath.endsWith('/')) {
        targetPath += '/';
      }
      const now: DateTime = DateTime.utc();
      targetPath +=
        'year=' +
        now.toFormat('yyyy') +
        '/month=' +
        now.toFormat('MM') +
        '/day=' +
        now.toFormat('dd') +
        '/hour=' +
        now.toFormat('HH') +
        '/' +
        now.toFormat('mm_ss__SSS');
      targetPath += '.json';
      try {
        await this.config.archive.writeObjectToCacheFile(targetPath, rts);
        rval = true;
      } catch (err) {
        Logger.warn('Failed to archive email %s %j : %s', targetPath, rts, err);
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
                  this.config.maxAttachmentSizeInBase64Bytes
              ),
            });
          }
        });
      }
      rts.attachments = filtered;
    }
  }

  public async sendEmail(inRts: ReadyToSendEmail): Promise<SendRawEmailCommandOutput> {
    RequireRatchet.notNullOrUndefined(inRts, 'RTS must be defined');
    RequireRatchet.notNullOrUndefined(inRts.destinationAddresses, 'Destination addresses must be defined');
    let rval: SendRawEmailCommandOutput = null;

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

    await this.archiveEmailIfConfigured(rts);

    if (rts.destinationAddresses.length === 0) {
      Logger.info('After cleaning email lists, no destination addresses left - not sending email');
    } else {
      const toLine: string = 'To: ' + rts.destinationAddresses.join(', ') + '\n';
      const bccLine: string = !!rts.bccAddresses && rts.bccAddresses.length > 0 ? 'Bcc: ' + rts.bccAddresses.join(', ') + '\n' : '';

      try {
        const from: string = rts.fromAddress || this.config.defaultSendingAddress;
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

        const params: SendRawEmailRequest = {
          RawMessage: { Data: new TextEncoder().encode(rawMail) },
        };

        rval = await this.ses.send(new SendRawEmailCommand(params));
      } catch (err) {
        Logger.error('Error while processing email: %s', err, err);
      }
    }
    return rval;
  }

  public static validEmail(email: string): boolean {
    return email !== null && Mailer.EMAIL.test(email);
  }

  /*
    public async sendEmail2(rts:ReadyToSendEmail): Promise<SendEmailResponse> {
        let rval: SendEmailResponse = null;

        try {
            //const p: SendRawEmailRequest = {};

            const params: SendEmailRequest = {
                Destination: {
                    ToAddresses: rts.destinationAddresses,
                    BccAddresses: this.autoBccAddresses
                },
                Message: {
                    Body: {
                        Html: {
                            Data: rts.htmlMessage
                        },
                        Text: {
                            Data: rts.txtMessage
                        }
                    },
                    Subject: {
                        Data: rts.subject
                    }
                },
                Source: rts.fromAddress || this.defaultSendingAddress
            };

            rval = await this.ses.sendEmail(params);

            Logger.debug('Got send result : %j', rval);
        } catch (err) {
            Logger.error("Error while processing email: %s" ,err,err);
        }
        return rval;
    }
    */
}

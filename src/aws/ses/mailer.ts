import * as AWS from 'aws-sdk';
import {ReadyToSendEmail} from './ready-to-send-email';
import {RequireRatchet} from '../../common/require-ratchet';
import {Logger} from '../../common/logger';
import {SendRawEmailRequest, SendRawEmailResponse} from 'aws-sdk/clients/ses';
import {RatchetTemplateRenderer} from './ratchet-template-renderer';
import {S3CacheRatchet} from '../s3-cache-ratchet';
import {StringRatchet} from '../../common/string-ratchet';
import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';
import {MailerConfig} from './mailer-config';
import {ErrorRatchet} from '../../common/error-ratchet';
import {ResolvedReadyToSendEmail} from './resolved-ready-to-send-email';

/**
 * Generic Mail Sender for AWS.
 *
 * Params:
 * ses: AWS SES handler, properly configured
 * defaultSendingAddress:
 */
export class Mailer {
    public static readonly EMAIL: RegExp = new RegExp(".+@.+\\.[a-z]+");

    constructor(private ses:AWS.SES,
                private config: MailerConfig = {} as MailerConfig){
        RequireRatchet.notNullOrUndefined(this.ses);
        if (!!config.archive && !config.archive.getDefaultBucket()) {
            throw new Error('If archive specified, must set a default bucket');
        }
    }

    public async fillEmailBody(rts: ReadyToSendEmail, context: any, htmlTemplateName:string,
                               txtTemplateName: string=null, layoutName: string = null): Promise<ReadyToSendEmail> {
        if (!this.config.templateRenderer) {
            ErrorRatchet.throwFormattedErr('Cannot use fill body if template renderer not set');
        }
        rts.htmlMessage = await this.config.templateRenderer.renderTemplate(htmlTemplateName, context, layoutName);
        rts.txtMessage = (!!txtTemplateName)?await this.config.templateRenderer.renderTemplate(txtTemplateName, context):null;
        return rts;
    }

    public async fillEmailBodyAndSend(rts: ReadyToSendEmail, context: any, htmlTemplateName:string,
                                      txtTemplateName: string=null, layoutName: string = null): Promise<SendRawEmailResponse> {
        const newVal: ReadyToSendEmail = await this.fillEmailBody(rts, context, htmlTemplateName, txtTemplateName, layoutName);
        const rval: SendRawEmailResponse = await this.sendEmail(newVal);
        return rval;
    }

    public filterEmailsToValid(emails: string[]): string[] {
        const rval: string[] = (emails || []).filter(e => {
            if (!this.config.allowedDestinationEmails || this.config.allowedDestinationEmails.length==0) {
                return true;
            } else {
                const match: RegExp = this.config.allowedDestinationEmails.find(s => s.test(e));
                return !!match;
            }
        });
        return rval;
    }

    private async archiveEmailIfConfigured(rts: ResolvedReadyToSendEmail): Promise<boolean> {
        let rval: boolean = false;
        if (!!rts && !!this.config.archive) {
            Logger.debug('Archiving outbound email to : %j', rts.destinationAddresses);
            let targetPath: string = StringRatchet.trimToEmpty(this.config.archivePrefix);
            if (!targetPath.endsWith('/')) {
                targetPath += '/';
            }
            const now: Moment = moment().tz('etc/GMT');
            targetPath += 'year=' + now.format('YYYY') + '/month=' + now.format('MM') + '/day=' + now.format('DD')
                + '/hour=' + now.format('HH') + '/' + now.format('mm_ss__SSS');
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

    public async sendEmail(inRts:ReadyToSendEmail): Promise<SendRawEmailResponse> {
        RequireRatchet.notNullOrUndefined(inRts, 'RTS must be defined');
        RequireRatchet.notNullOrUndefined(inRts.destinationAddresses, 'Destination addresses must be defined');
        let rval: SendRawEmailResponse = null;

        let toAddresses: string[] = this.filterEmailsToValid(inRts.destinationAddresses);
        if (toAddresses.length === 0 && !!inRts.bccAddresses && inRts.bccAddresses.length > 0) {
            Logger.debug('Destination emails filtered to none but BCC defined, copying BCC');
            toAddresses = Object.assign([], inRts.bccAddresses);
        }

        const rts: ResolvedReadyToSendEmail = Object.assign({}, inRts);
        rts.srcDestinationAddresses = inRts.destinationAddresses;
        rts.destinationAddresses = toAddresses;

        await this.archiveEmailIfConfigured(rts);

        if (rts.destinationAddresses.length === 0) {
            Logger.info('After cleaning email lists, no destination addresses left - not sending email');
        } else {
            let toLine: string = 'To: ' + rts.destinationAddresses.join(', ') + '\n';
            let bccLine: string = (!!this.config.autoBccAddresses && this.config.autoBccAddresses.length > 0) ?
                'Bcc: ' + this.config.autoBccAddresses.join(', ') + '\n' : '';

            try {
                const from: string = rts.fromAddress || this.config.defaultSendingAddress;
                const boundary: string = 'NextPart';
                let rawMail: string = 'From: ' + from + '\n';
                rawMail += toLine;
                rawMail += bccLine;
                rawMail += 'Subject: ' + rts.subject + '\n';
                rawMail += 'MIME-Version: 1.0\n';
                rawMail += 'Content-Type: multipart/mixed; boundary="' + boundary + '"\n';
                if (!!StringRatchet.trimToNull(rts.htmlMessage)) {
                    rawMail += '\n\n--' + boundary + '\n';
                    rawMail += 'Content-Type: text/html\n\n';
                    rawMail += rts.htmlMessage;
                }
                if (!!StringRatchet.trimToNull(rts.txtMessage)) {
                    rawMail += '\n\n--' + boundary + '\n';
                    rawMail += 'Content-Type: text/plain\n\n';
                    rawMail += rts.txtMessage;
                }
                if (rts.attachments) {
                    rts.attachments.forEach(a => {
                        rawMail += '\n\n--' + boundary + '\n';
                        rawMail += 'Content-Type: ' + a.contentType + '; name="' + a.filename + '"\n';
                        rawMail += 'Content-Transfer-Encoding: base64\n';
                        rawMail += 'Content-Disposition: attachment\n\n';
                        rawMail += a.base64Data.replace(/([^\0]{76})/g, '$1\n') + '\n\n';
                    })
                }
                rawMail += '\n\n--' + boundary + '\n';

                const params: SendRawEmailRequest = {
                    RawMessage: {Data: rawMail}
                };

                rval = await this.ses.sendRawEmail(params).promise();
            } catch (err) {
                Logger.error("Error while processing email: %s", err, err);
            }

        }
        return rval;

    }

    public static validEmail(email:string):boolean {
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

            rval = await this.ses.sendEmail(params).promise();

            Logger.debug('Got send result : %j', rval);
        } catch (err) {
            Logger.error("Error while processing email: %s" ,err,err);
        }
        return rval;
    }
    */

}

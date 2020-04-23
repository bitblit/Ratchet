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

export class Mailer {
    public static readonly EMAIL: RegExp = new RegExp(".+@.+\\.[a-z]+");

    constructor(private ses:AWS.SES,
                private defaultSendingAddress: string=null,
                private autoBccAddresses: string[] = [],
                private templateRenderer: RatchetTemplateRenderer = null,
                private disabled: boolean = false,
                private archive: S3CacheRatchet = null,
                private archivePrefix: string = null){
        RequireRatchet.notNullOrUndefined(this.ses);
        if (!!archive && !archive.getDefaultBucket()) {
            throw new Error('If archive specified, must set a default bucket');
        }
    }

    public async fillEmailBody(rts: ReadyToSendEmail, context: any, htmlTemplateName:string,
                               txtTemplateName: string=null, layoutName: string = null): Promise<ReadyToSendEmail> {
        rts.htmlMessage = await this.templateRenderer.renderTemplate(htmlTemplateName, context, layoutName);
        rts.txtMessage = (!!txtTemplateName)?await this.templateRenderer.renderTemplate(txtTemplateName, context):null;
        return rts;
    }

    public async fillEmailBodyAndSend(rts: ReadyToSendEmail, context: any, htmlTemplateName:string,
                                      txtTemplateName: string=null, layoutName: string = null): Promise<SendRawEmailResponse> {
        const newVal: ReadyToSendEmail = await this.fillEmailBody(rts, context, htmlTemplateName, txtTemplateName, layoutName);
        const rval: SendRawEmailResponse = await this.sendEmail(newVal);
        return rval;
    }

    public async sendEmail(rts:ReadyToSendEmail): Promise<SendRawEmailResponse> {
        let toLine: string = 'To: ' + rts.destinationAddresses.join(', ') + '\n';
        let bccLine: string = (!!this.autoBccAddresses && this.autoBccAddresses.length>0) ?
            'Bcc: ' + this.autoBccAddresses.join(', ') + '\n' : '';

        // If an archiver is configured, use it
        if (!!this.archive) {
            let targetPath: string = StringRatchet.trimToEmpty(this.archivePrefix);
            if (!targetPath.endsWith('/')) {
                targetPath += '/';
            }
            const now: Moment = moment().tz('etc/GMT');
            targetPath += 'year=' + now.format('YYYY') + '/month=' + now.format('MM') + '/day=' + now.format('DD')
             + '/hour=' + now.format('HH') + '/' + now.format('mm_ss__SSS');
            targetPath += '.json';
            try {
                await this.archive.writeObjectToCacheFile(targetPath, rts);
            } catch (err) {
                Logger.warn('Failed to archive email %s %j : %s', targetPath, rts, err);
            }
        }

        if (this.disabled) {
            Logger.info('Not sending email, mailer disabled.  Mail was : %j', rts);
            return null;
        }

        let rval: SendRawEmailResponse = null;
        try {
            const from: string = rts.fromAddress || this.defaultSendingAddress;
            const boundary: string = 'NextPart';
            let rawMail:string = 'From: '+from+'\n';
            rawMail += toLine;
            rawMail += bccLine;
            rawMail += 'Subject: '+rts.subject+'\n';
            rawMail += 'MIME-Version: 1.0\n';
            rawMail += 'Content-Type: multipart/mixed; boundary="'+boundary+'"\n';
            if (!!StringRatchet.trimToNull(rts.htmlMessage)) {
                rawMail += '\n\n--'+boundary+'\n';
                rawMail += 'Content-Type: text/html\n\n';
                rawMail += rts.htmlMessage;
            }
            if (!!StringRatchet.trimToNull(rts.txtMessage)) {
                rawMail += '\n\n--'+boundary+'\n';
                rawMail += 'Content-Type: text/plain\n\n';
                rawMail += rts.txtMessage;
            }
            if (rts.attachments) {
                rts.attachments.forEach(a=>{
                    rawMail += '\n\n--'+boundary+'\n';
                    rawMail += 'Content-Type: '+a.contentType+'; name="'+a.filename+'"\n';
                    rawMail += 'Content-Transfer-Encoding: base64\n';
                    rawMail += 'Content-Disposition: attachment\n\n';
                    rawMail += a.base64Data.replace(/([^\0]{76})/g, '$1\n') + '\n\n';
                })
            }
            rawMail += '\n\n--'+boundary+'\n';

            const params: SendRawEmailRequest = {
                RawMessage: {Data: rawMail}
            };

            rval = await this.ses.sendRawEmail(params).promise();
        } catch (err) {
            Logger.error("Error while processing email: %s" ,err,err);
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

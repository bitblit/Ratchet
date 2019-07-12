import * as AWS from 'aws-sdk';
import {RemoteHandlebarsTemplateRenderer} from './remote-handlebars-template-renderer';
import {ReadyToSendEmail} from './ready-to-send-email';
import {RequireRatchet} from '../../common/require-ratchet';
import {Logger} from '../../common/logger';
import {SendEmailRequest, SendEmailResponse} from 'aws-sdk/clients/ses';

export class Mailer {
    public static readonly EMAIL: RegExp = new RegExp(".+@.+\\.[a-z]+");

    constructor(private ses:AWS.SES,
                private defaultSendingAddress: string=null,
                private autoBccAddresses: string[] = [],
                private templateRenderer: RemoteHandlebarsTemplateRenderer = null){
        RequireRatchet.notNullOrUndefined(this.ses);
    }

    public async fillEmailBody(rts: ReadyToSendEmail, context: any, htmlTemplateName:string, txtTemplateName: string=null): Promise<ReadyToSendEmail> {
        rts.htmlMessage = await this.templateRenderer.renderRemoteTemplate(htmlTemplateName, context);
        rts.txtMessage = (!!txtTemplateName)?await this.templateRenderer.renderRemoteTemplate(txtTemplateName, context):null;
        return rts;
    }

    public async sendEmail(rts:ReadyToSendEmail): Promise<SendEmailResponse> {
        let rval: SendEmailResponse = null;

        try {
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

            /*
            if (rts.getAttachments() != null) {
                for (EmailAttachment a : rts.getAttachments()) {
                    msg.addAttachment(a.getFilename(), new ByteArrayResource(a.getData()), a.getContentType());
                }
            }
            */

            rval = await this.ses.sendEmail(params).promise();

            Logger.debug('Got send result : %j', rval);
        } catch (err) {
            Logger.error("Error while processing the error email thread: %s" ,err,err);
        }
        return rval;
    }

    public static validEmail(email:string):boolean {
        return email !== null && Mailer.EMAIL.test(email);
    }

}

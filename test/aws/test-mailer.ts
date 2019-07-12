import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import * as AWS from 'aws-sdk';
import {S3CacheRatchet} from '../../src/aws/s3-cache-ratchet';
import {ReadyToSendEmail} from '../../src/aws/ses/ready-to-send-email';
import {SendEmailResponse} from 'aws-sdk/clients/ses';
import {Mailer} from '../../src/aws/ses/mailer';

describe('#mailer', function() {
    it('should send email', async() => {
        //this.bail();
        let ses: AWS.SES = new AWS.SES({region: 'us-east-1'});
        let svc: Mailer = new Mailer(ses);

        let rts: ReadyToSendEmail = {
            txtMessage: 'test txt',
            htmlMessage: '<h1>Test html</h1><p>Test paragraph</p>',
            subject: 'Test subject',
            fromAddress: 'test@adomni.com',
            destinationAddresses: ['cweiss@adomni.com']
        }

        const result: SendEmailResponse = await svc.sendEmail(rts);

        expect(result).to.not.equal(null);
    });

});
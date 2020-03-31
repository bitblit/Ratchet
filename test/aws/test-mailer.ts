import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import * as AWS from 'aws-sdk';
import {S3CacheRatchet} from '../../src/aws/s3-cache-ratchet';
import {ReadyToSendEmail} from '../../src/aws/ses/ready-to-send-email';
import {SendEmailResponse} from 'aws-sdk/clients/ses';
import {Mailer} from '../../src/aws/ses/mailer';
import {EmailAttachment} from '../../src/aws/ses/email-attachment';
import {StringRatchet} from '../../src/common/string-ratchet';
import {Base64Ratchet} from '../../src/common/base64-ratchet';
import * as fs from 'fs';

describe('#mailer', function() {
    xit('should send email', async() => {
        let ses: AWS.SES = new AWS.SES({region: 'us-east-1'});
        let svc: Mailer = new Mailer(ses, 'test1@test.com', ['test2@test.com','test2@test.com']);

        const attach1: EmailAttachment = {
          filename: 'test.txt',
          contentType: 'text/plain',
          base64Data: Base64Ratchet.generateBase64VersionOfString('This is a test2')
        };

        const attach2: EmailAttachment = {
            filename: 'a2.jpg',
            contentType: 'image/jpg',
            base64Data: fs.readFileSync('a2.jpg').toString('base64')
        };

        let rts: ReadyToSendEmail = {
            txtMessage: 'test txt',
            htmlMessage: '<h1>Test html</h1><p>Test paragraph</p>',
            subject: 'Test subject',
            fromAddress: 'test@adomni.com',
            destinationAddresses: ['test4@test.com'],
            attachments: [attach1,attach2]
        }

        const result: SendEmailResponse = await svc.sendEmail(rts);

        expect(result).to.not.equal(null);

    });

});

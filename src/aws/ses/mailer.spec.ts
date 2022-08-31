import * as AWS from 'aws-sdk';
import { ReadyToSendEmail } from './ready-to-send-email';
import { SendEmailResponse } from 'aws-sdk/clients/ses';
import { Mailer } from './mailer';
import { EmailAttachment } from './email-attachment';
import { StringRatchet } from '../../common/string-ratchet';
import { Base64Ratchet } from '../../common/base64-ratchet';
import fs from 'fs';
import { MailerConfig } from './mailer-config';

describe('#mailer', function () {
  xit('should send email', async () => {
    const ses: AWS.SES = new AWS.SES({ region: 'us-east-1' });
    const config: MailerConfig = {
      defaultSendingAddress: 'test1@test.com',
      autoBccAddresses: [], //['test2@test.com','test2@test.com'],
      archive: null, //new S3CacheRatchet(new AWS.S3(), 'outbound-email-archive'),
      archivePrefix: null, //'test'
    };
    const svc: Mailer = new Mailer(ses, config);

    const attach1: EmailAttachment = {
      filename: 'test.txt',
      contentType: 'text/plain',
      base64Data: Base64Ratchet.generateBase64VersionOfString('This is a test2'),
    };

    const attach2: EmailAttachment = {
      filename: 'a2.png',
      contentType: 'image/png',
      base64Data: fs.readFileSync('test/data/a2.png').toString('base64'),
    };

    const rts: ReadyToSendEmail = {
      txtMessage: 'test txt',
      htmlMessage: '<h1>Test html</h1><p>Test paragraph</p>',
      subject: 'Test subject',
      fromAddress: 'test@test.com',
      destinationAddresses: ['testout@test.com'],
      attachments: [attach1, attach2],
    };

    const result: SendEmailResponse = await svc.sendEmail(rts);

    expect(result).toBeTruthy();
  });

  xit('should filter outbound', async () => {
    const config: MailerConfig = {
      allowedDestinationEmails: [/.*test\.com/, /.*.test2\.com/],
    };
    const svc: Mailer = new Mailer({} as AWS.SES, config);

    const out1: string[] = ['a@test.com', 'b@fail.com'];
    const res1: string[] = svc.filterEmailsToValid(out1);
    expect(res1).toBeTruthy();
    expect(res1.length).toEqual(1);

    const out2: string[] = ['a@fail.com', 'b@fail.com'];
    const res2: string[] = svc.filterEmailsToValid(out2);
    expect(res2).toBeTruthy();
    expect(res2.length).toEqual(0);
  });

  xit('should fix a huge text/html body', async () => {
    const ses: AWS.SES = new AWS.SES({ region: 'us-east-1' });
    const config: MailerConfig = {
      defaultSendingAddress: 'test@test.com',
      autoBccAddresses: [], //['test2@test.com','test2@test.com'],
      archive: null, //new S3CacheRatchet(new AWS.S3(), 'outbound-email-archive'),
      archivePrefix: null, //'test'
      maxMessageBodySizeInBytes: 500,
      maxAttachmentSizeInBase64Bytes: 1000,
    };
    const svc: Mailer = new Mailer(ses, config);

    const bigBody: string = StringRatchet.createRandomHexString(300);

    const bigAttach: EmailAttachment = {
      filename: 'test.txt',
      contentType: 'text/plain',
      base64Data: Base64Ratchet.generateBase64VersionOfString(StringRatchet.createRandomHexString(2000)),
    };

    const rts: ReadyToSendEmail = {
      txtMessage: bigBody,
      htmlMessage: bigBody,
      subject: 'Test big message',
      fromAddress: 'test@test.com',
      destinationAddresses: ['test@test.com'],
      attachments: [bigAttach],
    };

    const result: SendEmailResponse = await svc.sendEmail(rts);

    expect(result).toBeTruthy();
  });
});

import { ReadyToSendEmail } from './ready-to-send-email.js';
import { SendEmailResponse, SendRawEmailCommand, SendRawEmailCommandOutput, SESClient } from '@aws-sdk/client-ses';
import { Mailer } from './mailer.js';
import { EmailAttachment } from './email-attachment.js';
import { StringRatchet } from '@bitblit/ratchet-common/lib/lang/string-ratchet.js';
import { Base64Ratchet } from '@bitblit/ratchet-common/lib/lang/base64-ratchet.js';
import { MailerConfig } from './mailer-config.js';
import { mockClient } from 'aws-sdk-client-mock';

let mockSES;
const smallImageBase64: string =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';

describe('#mailer', function () {
  mockSES = mockClient(SESClient);

  beforeEach(() => {
    mockSES.reset();
  });

  it('should send email', async () => {
    const config: MailerConfig = {
      defaultSendingAddress: 'test1@test.com',
      autoBccAddresses: [], //['test2@test.com','test2@test.com'],
      archive: null, //new S3CacheRatchet(new S3(), 'outbound-email-archive'),
      archivePrefix: null, //'test'
    };
    const svc: Mailer = new Mailer(mockSES, config);

    const attach1: EmailAttachment = {
      filename: 'test.txt',
      contentType: 'text/plain',
      base64Data: Base64Ratchet.generateBase64VersionOfString('This is a test2'),
    };

    const attach2: EmailAttachment = {
      filename: 'a2.png',
      contentType: 'image/png',
      base64Data: smallImageBase64,
    };

    const rts: ReadyToSendEmail = {
      txtMessage: 'test txt',
      htmlMessage: '<h1>Test html</h1><p>Test paragraph</p>',
      subject: 'Test subject',
      fromAddress: 'test@test.com',
      destinationAddresses: ['testout@test.com'],
      attachments: [attach1, attach2],
    };

    mockSES.on(SendRawEmailCommand).resolves({} as SendRawEmailCommandOutput);

    const result: SendEmailResponse = await svc.sendEmail(rts);

    expect(result).toBeTruthy();
  });

  it('should allow for unicode in email subject', async () => {
    const config: MailerConfig = {
      defaultSendingAddress: 'jflint@adomni.com',
      autoBccAddresses: [],
      archive: null,
      archivePrefix: null,
    };
    const svc: Mailer = new Mailer(mockSES, config);
    const rts: ReadyToSendEmail = {
      txtMessage: 'test txt',
      htmlMessage: '<h1>Test html</h1><p>Test paragraph</p>',
      subject: "Rappel: Votre panneau d'affichage Shout est diffusé aujourd'hui!", // <==== We are testing these unicode characters
      fromAddress: 'jflint@adomni.com',
      destinationAddresses: ['jflint@adomni.com'],
    };

    mockSES.on(SendRawEmailCommand).resolves({} as SendRawEmailCommandOutput);

    const result: SendEmailResponse = await svc.sendEmail(rts);
    expect(result).toBeTruthy();
  });

  it('should filter outbound', async () => {
    const config: MailerConfig = {
      allowedDestinationEmails: [/.*test\.com/, /.*.test2\.com/],
    };
    const svc: Mailer = new Mailer({} as SESClient, config);

    const out1: string[] = ['a@test.com', 'b@fail.com'];
    const res1: string[] = svc.filterEmailsToValid(out1);
    expect(res1).toBeTruthy();
    expect(res1.length).toEqual(1);

    const out2: string[] = ['a@fail.com', 'b@fail.com'];
    const res2: string[] = svc.filterEmailsToValid(out2);
    expect(res2).toBeTruthy();
    expect(res2.length).toEqual(0);
  });

  it('should fix a huge text/html body', async () => {
    const config: MailerConfig = {
      defaultSendingAddress: 'test@test.com',
      autoBccAddresses: [], //['test2@test.com','test2@test.com'],
      archive: null, //new S3CacheRatchet(new S3(), 'outbound-email-archive'),
      archivePrefix: null, //'test'
      maxMessageBodySizeInBytes: 500,
      maxAttachmentSizeInBase64Bytes: 1000,
    };
    const svc: Mailer = new Mailer(mockSES, config);

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

    mockSES.on(SendRawEmailCommand).resolves({} as SendRawEmailCommandOutput);

    const result: SendEmailResponse = await svc.sendEmail(rts);

    expect(result).toBeTruthy();
  });
});

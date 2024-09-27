import { BrevoKeys } from './brevo-keys.js';
import { BrevoRatchet } from './brevo-ratchet.js';
import { BrevoMailSendingProvider } from './brevo-mail-sending-provider.js';
import { CreateSmtpEmail } from './generated/models/CreateSmtpEmail.js';
import { describe, expect, test } from 'vitest';
import { ReadyToSendEmail } from '@bitblit/ratchet-common/mail/ready-to-send-email';
import { Mailer } from '@bitblit/ratchet-common/mail/mailer';

describe('#brevoRatchet', () => {
  test.skip('should fetch account info', async () => {
    const keys: Promise<BrevoKeys> = Promise.resolve({
      smtpServer: 'test',
      smtpPort: 0,
      username: 'test',
      smtpKey: 'test',
      apiKey: 'test',
    });

    const br: BrevoRatchet = new BrevoRatchet(keys);

    //const val: any = await br.fetchAccountData();

    const rts: ReadyToSendEmail = {
      destinationAddresses: ['test'],
      htmlMessage: '<p>this is a test email</p>',
      fromAddress: 'test',
      fromName: 'test from',
      subject: 'test subject',
    };

    const mailer: Mailer<CreateSmtpEmail, string> = new Mailer<CreateSmtpEmail, string>({ provider: new BrevoMailSendingProvider(br) });
    const val: any = await mailer.sendEmail(rts);
    expect(val).not.toBeNull();
  });
});

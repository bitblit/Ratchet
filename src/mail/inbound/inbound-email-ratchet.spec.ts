import { InboundEmailRatchet } from './inbound-email-ratchet';
import * as AWS from 'aws-sdk';
import { S3CacheRatchet } from '../../aws/s3-cache-ratchet';

describe('#inboundEmailService', () => {
  xit('should process an email', async () => {
    const svc: InboundEmailRatchet = new InboundEmailRatchet(new S3CacheRatchet(new AWS.S3({ region: 'us-east-1' }), 'test-bucket'));

    //const buf: Buffer = fs.readFileSync('testemail.txt');
    //const res: boolean = await svc.processEmailFromBuffer(buf);
    const res: boolean = await svc.processEmailFromS3('some-key');

    expect(res).not.toBeUndefined();
  });
});

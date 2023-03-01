import { InboundEmailRatchet } from './inbound-email-ratchet';
import { S3CacheRatchet } from '../../aws/s3/s3-cache-ratchet';
import { JestRatchet } from '../../jest';

let mockS3CR: jest.Mocked<S3CacheRatchet>;

describe('#inboundEmailService', () => {
  beforeEach(() => {
    mockS3CR = JestRatchet.mock();
  });

  xit('should process an email from S3', async () => {
    mockS3CR.getDefaultBucket.mockReturnValueOnce('TEST-BUCKET');
    mockS3CR.fileExists.mockResolvedValueOnce(true);
    mockS3CR.readCacheFileToString.mockResolvedValueOnce('TEST');

    const svc: InboundEmailRatchet = new InboundEmailRatchet(mockS3CR);

    //const buf: Buffer = fs.readFileSync('testemail.txt');
    //const res: boolean = await svc.processEmailFromBuffer(buf);
    const res: boolean = await svc.processEmailFromS3('some-key');

    expect(res).not.toBeUndefined();
  });
});

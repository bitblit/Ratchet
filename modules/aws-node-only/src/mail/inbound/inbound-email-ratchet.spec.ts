import { InboundEmailRatchet } from './inbound-email-ratchet.js';
import { S3CacheRatchet } from '@bitblit/ratchet-aws/s3/s3-cache-ratchet.js';
import { JestRatchet } from '@bitblit/ratchet-jest/jest/jest-ratchet.js';
import { jest } from '@jest/globals';
import { SampleEmailProcessor } from './sample-email-processor.js';

let mockS3CR: jest.Mocked<S3CacheRatchet>;

describe('#inboundEmailService', () => {
  beforeEach(() => {
    mockS3CR = JestRatchet.mock(jest.fn);
  });

  it('should process an email from S3', async () => {
    mockS3CR.getDefaultBucket.mockReturnValueOnce('TEST-BUCKET');
    mockS3CR.fileExists.mockResolvedValueOnce(true);
    mockS3CR.fetchCacheFileAsString.mockResolvedValue('TEST');

    const svc: InboundEmailRatchet = new InboundEmailRatchet(mockS3CR, [new SampleEmailProcessor()]);

    //const buf: Buffer = fs.readFileSync('testemail.txt');
    //const res: boolean = await svc.processEmailFromBuffer(buf);
    const res: boolean = await svc.processEmailFromS3('some-key');

    expect(res).not.toBeUndefined();
  });
});

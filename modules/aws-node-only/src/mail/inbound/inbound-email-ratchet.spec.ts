import { InboundEmailRatchet } from './inbound-email-ratchet.js';
import { S3CacheRatchet } from '@bitblit/ratchet-aws';

import { SampleEmailProcessor } from './sample-email-processor.js';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

let mockS3CR: MockProxy<S3CacheRatchet>;

describe('#inboundEmailService', () => {
  beforeEach(() => {
    mockS3CR = mock<S3CacheRatchet>();
  });

  test('should process an email from S3', async () => {
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

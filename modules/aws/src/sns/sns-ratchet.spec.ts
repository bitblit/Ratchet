import { PublishCommand, PublishCommandOutput, SNSClient } from '@aws-sdk/client-sns';
import { SnsRatchet } from './sns-ratchet.js';
import { mockClient } from 'aws-sdk-client-mock';
import { beforeEach, describe, expect, test } from 'vitest';

let mockSNS;

describe('#SNSRatchet', function () {
  mockSNS = mockClient(SNSClient);
  beforeEach(() => {
    mockSNS.reset();
  });

  test('should send a message', async () => {
    //mockSNS.publish.resolves({} as PublishCommandOutput as never);
    mockSNS.on(PublishCommand).resolves({} as PublishCommandOutput);

    const topicArn: string = 'TOPIC-ARN-HERE';
    const ratchet: SnsRatchet = new SnsRatchet(mockSNS, topicArn);
    const out: PublishCommandOutput = await ratchet.sendMessage('test \n\n' + new Date() + '\n\n---\n\nTest CR');

    expect(out).toBeTruthy();
  });
});

import AWS from 'aws-sdk';
import { SnsRatchet } from './sns-ratchet';
import { PublishResponse } from 'aws-sdk/clients/sns';
import { JestRatchet } from '../jest';

let mockSNS: jest.Mocked<AWS.SNS>;

describe('#SNSRatchet', function () {
  beforeEach(() => {
    mockSNS = JestRatchet.mock();
  });

  it('should send a message', async () => {
    mockSNS.publish.mockReturnValue({
      promise: async () => Promise.resolve({} as PublishResponse),
    } as never);

    const topicArn: string = 'TOPIC-ARN-HERE';
    const ratchet: SnsRatchet = new SnsRatchet(mockSNS, topicArn);
    const out: PublishResponse = await ratchet.sendMessage('test \n\n' + new Date() + '\n\n---\n\nTest CR');

    expect(out).toBeTruthy();
  });
});

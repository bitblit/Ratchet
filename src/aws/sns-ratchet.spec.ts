import AWS_SNS, { SNS } from '@aws-sdk/client-sns';
import { SnsRatchet } from './sns-ratchet';
import { JestRatchet } from '../jest';

let mockSNS: jest.Mocked<SNS>;

describe('#SNSRatchet', function () {
  beforeEach(() => {
    mockSNS = JestRatchet.mock();
  });

  it('should send a message', async () => {
    mockSNS.publish.mockReturnValue({
      promise: async () => Promise.resolve({} as AWS_SNS.PublishCommandOutput),
    } as never);

    const topicArn: string = 'TOPIC-ARN-HERE';
    const ratchet: SnsRatchet = new SnsRatchet(mockSNS, topicArn);
    const out: AWS_SNS.PublishCommandOutput = await ratchet.sendMessage('test \n\n' + new Date() + '\n\n---\n\nTest CR');

    expect(out).toBeTruthy();
  });
});

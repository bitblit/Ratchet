import { Substitute } from '@fluffy-spoon/substitute';
import AWS from 'aws-sdk';
import { SnsRatchet } from './sns-ratchet';
import { PublishResponse } from 'aws-sdk/clients/sns';

describe('#SNSRatchet', function () {
  xit('should send a message', async () => {
    const sns: AWS.SNS = new AWS.SNS({ apiVersion: '2010-03-31', region: 'us-east-1' });
    const topicArn: string = 'TOPIC-ARN-HERE';
    const ratchet: SnsRatchet = new SnsRatchet(sns, topicArn);
    const out: PublishResponse = await ratchet.sendMessage('test \n\n' + new Date() + '\n\n---\n\nTest CR');

    expect(out).toBeTruthy();
  });
});

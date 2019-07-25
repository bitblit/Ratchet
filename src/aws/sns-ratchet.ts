import {Logger} from '../common/logger';
import * as AWS from 'aws-sdk';
import {PublishInput, PublishResponse} from 'aws-sdk/clients/sns';

export class SnsRatchet {

    constructor(private sns: AWS.SNS = new AWS.SNS({apiVersion: '2010-03-31', region: 'us-east-1'}), private topicArn: string) {
    }

    public async sendMessage(msg: string): Promise<PublishResponse> {

        const params: PublishInput = {
            TopicArn: this.topicArn,
            Message: msg
        };

        Logger.debug('Sending via SNS : %j', params);
        const result: PublishResponse = await this.sns.publish(params).promise();
        return result;
    }



}
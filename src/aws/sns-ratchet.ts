import { Logger } from '../common/logger';
import AWS from 'aws-sdk';
import { PublishInput, PublishResponse } from 'aws-sdk/clients/sns';
import { RequireRatchet } from '../common';

export class SnsRatchet {
  constructor(private sns: AWS.SNS = new AWS.SNS({ apiVersion: '2010-03-31', region: 'us-east-1' }), private topicArn: string) {
    RequireRatchet.notNullOrUndefined(this.sns, 'sns');
    RequireRatchet.notNullOrUndefined(this.topicArn, 'topicArn');
  }

  public async sendMessage(inMsg: any, suppressErrors: boolean = false): Promise<PublishResponse> {
    let result: PublishResponse = null;
    try {
      const safeInMsg: any = inMsg ? inMsg : 'NO-MESSAGE-PROVIDED';
      const msg: string = typeof safeInMsg === 'string' ? safeInMsg : JSON.stringify(safeInMsg);

      const params: PublishInput = {
        TopicArn: this.topicArn,
        Message: msg,
      };

      Logger.debug('Sending via SNS : %j', params);
      result = await this.sns.publish(params).promise();
    } catch (err) {
      if (suppressErrors) {
        Logger.error('Failed to fire SNS notification : %j : %s', inMsg, err);
      } else {
        throw err;
      }
    }
    return result;
  }

  // Kinda a special case, used for when you want to only send messages when a certain condition is true
  // (Like when you are running in production)
  public async conditionallySendMessage(inMsg: any, condition: boolean, suppressErrors: boolean = false): Promise<PublishResponse> {
    let rval: PublishResponse = null;
    if (condition) {
      rval = await this.sendMessage(inMsg, suppressErrors);
    } else {
      Logger.info('Not sending message, condition was false : %j', inMsg);
    }
    return rval;
  }
}

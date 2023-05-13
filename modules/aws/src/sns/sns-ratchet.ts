import { Logger, RequireRatchet } from '@bitblit/ratchet-common';
import { PublishCommand, PublishCommandInput, PublishCommandOutput, SNSClient } from '@aws-sdk/client-sns';

export class SnsRatchet {
  constructor(private sns: SNSClient = new SNSClient({ region: 'us-east-1' }), private topicArn: string) {
    RequireRatchet.notNullOrUndefined(this.sns, 'sns');
    RequireRatchet.notNullOrUndefined(this.topicArn, 'topicArn');
  }

  public get snsClient(): SNSClient {
    return this.sns;
  }

  public async sendMessage(inMsg: any, suppressErrors: boolean = false): Promise<PublishCommandOutput> {
    let result: PublishCommandOutput = null;
    try {
      const safeInMsg: any = inMsg ? inMsg : 'NO-MESSAGE-PROVIDED';
      const msg: string = typeof safeInMsg === 'string' ? safeInMsg : JSON.stringify(safeInMsg);

      const params: PublishCommandInput = {
        TopicArn: this.topicArn,
        Message: msg,
      };

      Logger.debug('Sending via SNS : %j', params);
      result = await this.sns.send(new PublishCommand(params));
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
  public async conditionallySendMessage(inMsg: any, condition: boolean, suppressErrors: boolean = false): Promise<PublishCommandOutput> {
    let rval: PublishCommandOutput = null;
    if (condition) {
      rval = await this.sendMessage(inMsg, suppressErrors);
    } else {
      Logger.info('Not sending message, condition was false : %j', inMsg);
    }
    return rval;
  }
}

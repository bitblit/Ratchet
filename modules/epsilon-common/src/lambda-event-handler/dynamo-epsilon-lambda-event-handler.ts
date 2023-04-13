import { EpsilonLambdaEventHandler } from '../config/epsilon-lambda-event-handler.js';
import { Context, DynamoDBStreamEvent, ProxyResult } from 'aws-lambda';
import { GenericAwsEventHandlerFunction } from '../config/generic-aws-event-handler-function.js';
import { Logger } from '@bitblit/ratchet-common/dist/logger/logger.js';
import { AwsUtil } from '../util/aws-util.js';
import { EpsilonInstance } from '../epsilon-instance.js';
import { LambdaEventDetector } from '@bitblit/ratchet-aws/dist/lambda/lambda-event-detector.js';

export class DynamoEpsilonLambdaEventHandler implements EpsilonLambdaEventHandler<DynamoDBStreamEvent> {
  constructor(private _epsilon: EpsilonInstance) {}

  public extractLabel(evt: DynamoDBStreamEvent, context: Context): string {
    return 'DDBEvt:' + evt.Records[0].eventName + ':' + evt.Records[0].eventSource;
  }

  public handlesEvent(evt: any): boolean {
    return LambdaEventDetector.isValidDynamoDBEvent(evt);
  }

  public async processEvent(evt: DynamoDBStreamEvent, context: Context): Promise<ProxyResult> {
    let rval: any = null;
    if (this._epsilon.config && this._epsilon.config.dynamoDb && evt && evt.Records && evt.Records.length > 0) {
      const finder: string = evt.Records[0].eventSourceARN;
      const handler: GenericAwsEventHandlerFunction<DynamoDBStreamEvent> = AwsUtil.findInMap<
        GenericAwsEventHandlerFunction<DynamoDBStreamEvent>
      >(finder, this._epsilon.config.dynamoDb.handlers);
      if (handler) {
        rval = await handler(evt);
      } else {
        Logger.info('Found no Dynamo handler for : %s', finder);
      }
    }
    return rval;
  }

  public async processUncaughtError(event: DynamoDBStreamEvent, context: Context, err: any): Promise<ProxyResult> {
    Logger.error('Error slipped out to outer edge (Dynamo).  Logging and rethrowing : %s', err, err);
    throw err;
  }
}

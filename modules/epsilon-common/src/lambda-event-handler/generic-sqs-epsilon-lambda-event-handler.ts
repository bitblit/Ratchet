import { EpsilonLambdaEventHandler } from '../config/epsilon-lambda-event-handler.js';
import { Context, ProxyResult, SQSEvent } from 'aws-lambda';
import { GenericAwsEventHandlerFunction } from '../config/generic-aws-event-handler-function.js';
import { AwsUtil } from '../util/aws-util.js';
import { EpsilonInstance } from '../epsilon-instance.js';
import { NoHandlersFoundError } from '../config/no-handlers-found-error.js';
import { LambdaEventDetector } from '@bitblit/ratchet-aws/lambda/lambda-event-detector';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

export class GenericSqsEpsilonLambdaEventHandler implements EpsilonLambdaEventHandler<SQSEvent> {
  constructor(private _epsilon: EpsilonInstance) {}

  public extractLabel(evt: SQSEvent, _context: Context): string {
    return 'SQSEvt:' + evt.Records[0].eventSourceARN;
  }

  public handlesEvent(evt: any): boolean {
    return LambdaEventDetector.isValidSqsEvent(evt);
  }

  public async processEvent(evt: SQSEvent, _context: Context): Promise<ProxyResult> {
    let rval: any = null;
    if (this._epsilon.config && this._epsilon.config.sqs && evt && evt.Records.length > 0) {
      const finder: string = evt.Records[0].eventSourceARN;
      const handler: GenericAwsEventHandlerFunction<SQSEvent> = AwsUtil.findInMap<GenericAwsEventHandlerFunction<SQSEvent>>(
        finder,
        this._epsilon.config.sqs.handlers,
      );
      if (handler) {
        rval = await handler(evt);
      } else {
        Logger.info('Found no SQS handler for : %s', finder);
        throw new NoHandlersFoundError();
      }
    }
    return rval;
  }

  public async processUncaughtError(event: SQSEvent, context: Context, err: any): Promise<ProxyResult> {
    Logger.error('Error slipped out to outer edge (SQS).  Logging and rethrowing : %s', err, err);
    throw err;
  }
}

import { EpsilonLambdaEventHandler } from '../config/epsilon-lambda-event-handler.js';
import { Context, ProxyResult, SNSEvent } from 'aws-lambda';
import { EpsilonInstance } from '../epsilon-instance.js';
import { InterApiUtil } from '../inter-api/inter-api-util.js';
import { InterApiEntry } from '../inter-api/inter-api-entry.js';

export class InterApiEpsilonLambdaEventHandler implements EpsilonLambdaEventHandler<SNSEvent> {
  constructor(private _epsilon: EpsilonInstance) {}

  public extractLabel(evt: SNSEvent, _context: Context): string {
    const ent: InterApiEntry<any> = InterApiUtil.extractEntryFromEvent(evt);
    return 'InterApi:' + ent.source + ':' + ent.type;
  }

  public handlesEvent(evt: any): boolean {
    return this._epsilon.config.interApiConfig && InterApiUtil.isInterApiSnsEvent(evt);
  }

  public async processEvent(evt: SNSEvent, _context: Context): Promise<ProxyResult> {
    const tmp: string[] = await InterApiUtil.processInterApiEvent(
      evt,
      this._epsilon.config.interApiConfig,
      this._epsilon.backgroundManager,
    );
    const rval: ProxyResult = {
      statusCode: 200,
      body: JSON.stringify(tmp),
      isBase64Encoded: false,
    };

    return rval;
  }
}

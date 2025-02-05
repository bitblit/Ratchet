import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { GetQueueAttributesCommand, GetQueueAttributesResult, SQSClient } from '@aws-sdk/client-sqs';
//import { ModelValidator } from '@bitblit/ratchet-misc/model-validator/model-validator';
import { AwsSqsSnsBackgroundManager } from './aws-sqs-sns-background-manager.js';
import { BackgroundConfig } from '../../config/background/background-config.js';
import { EchoProcessor } from '../../built-in/background/echo-processor.js';
import { NoOpProcessor } from '../../built-in/background/no-op-processor.js';
import { BackgroundAwsConfig } from '../../config/background/background-aws-config.js';
import { SNSClient } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';
import { beforeEach, describe, expect, test } from 'vitest';

let mockSqs;
let mockSns;

describe('#createEntry', function () {
  mockSns = mockClient(SNSClient);
  mockSqs = mockClient(SQSClient);

  let backgroundMgr: AwsSqsSnsBackgroundManager;
  const fakeAccountNumber: string = '123456789012';
  let _backgroundConfig: BackgroundConfig;
  let backgroundAwsConfig: BackgroundAwsConfig;
  //const fakeModelValidator: ModelValidator = new ModelValidator({ BackgroundBuiltInSampleInputValidatedProcessor: {} });

  const echoProcessor: EchoProcessor = new EchoProcessor();
  const noOpProcessor: NoOpProcessor = new NoOpProcessor();

  beforeEach(() => {
    mockSqs.reset();
    mockSns.reset();

    _backgroundConfig = {
      processors: [echoProcessor, noOpProcessor],
      httpSubmissionPath: '/background/',
      implyTypeFromPathSuffix: true,
      httpMetaEndpoint: '/background-meta',
    };

    backgroundAwsConfig = {
      queueUrl: 'https://fake-sqs.fake-availability-zone.test.com/' + fakeAccountNumber + '/fakeQueue.fifo',
      notificationArn: 'arn:aws:sns:fake-availability-zone:' + fakeAccountNumber + ':fakeSnsTopicName',
    };

    backgroundMgr = new AwsSqsSnsBackgroundManager(backgroundAwsConfig, mockSqs, mockSns);
  });

  test('Should return queue attributes', async () => {
    mockSqs.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: 1,
      },
    });

    const queueAttr: GetQueueAttributesResult = await backgroundMgr.fetchCurrentQueueAttributes();
    const msgCount: number = await backgroundMgr.fetchApproximateNumberOfQueueEntries();
    Logger.info('Got : %j', queueAttr);
    Logger.info('Msg: %d', msgCount);
    expect(queueAttr).toBeTruthy();
    expect(msgCount).toEqual(1);
  });

  test('Should round-trip guids with prefix no slash', async () => {
    const prefix: string = 'test';
    const guid: string = AwsSqsSnsBackgroundManager.generateBackgroundGuid();
    expect(guid).toBeTruthy();
    const path: string = AwsSqsSnsBackgroundManager.backgroundGuidToPath(prefix, guid);
    const outGuid: string = AwsSqsSnsBackgroundManager.pathToBackgroundGuid(prefix, path);
    expect(outGuid).toEqual(guid);
  });

  test('Should round-trip guids with prefix with slash', async () => {
    const prefix: string = 'test/';
    const guid: string = AwsSqsSnsBackgroundManager.generateBackgroundGuid();
    expect(guid).toBeTruthy();
    const path: string = AwsSqsSnsBackgroundManager.backgroundGuidToPath(prefix, guid);
    const outGuid: string = AwsSqsSnsBackgroundManager.pathToBackgroundGuid(prefix, path);
    expect(outGuid).toEqual(guid);
  });

  test('Should round-trip guids with no prefix', async () => {
    const prefix: string = null;
    const guid: string = AwsSqsSnsBackgroundManager.generateBackgroundGuid();
    expect(guid).toBeTruthy();
    const path: string = AwsSqsSnsBackgroundManager.backgroundGuidToPath(prefix, guid);
    const outGuid: string = AwsSqsSnsBackgroundManager.pathToBackgroundGuid(prefix, path);
    expect(outGuid).toEqual(guid);
  });
});

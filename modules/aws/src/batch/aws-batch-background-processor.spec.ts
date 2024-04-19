import { AwsBatchRatchet } from './aws-batch-ratchet.js';
import { SubmitJobCommandOutput } from '@aws-sdk/client-batch';
import { AwsBatchBackgroundProcessor } from './aws-batch-background-processor.js';
import { beforeEach, describe, expect, test } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

let mockBatchRatchet: MockProxy<AwsBatchRatchet>;

describe('#AwsBatchBackgroundProcessor', () => {
  beforeEach(() => {
    mockBatchRatchet = mock<AwsBatchRatchet>();
  });

  test('Should schedule background task', async () => {
    //mockBatchRatchet.defaultQueueName = 'a';
    mockBatchRatchet.scheduleJob.mockResolvedValue({ jobId: 'newID', jobName: 'name', $metadata: null });
    const svc: AwsBatchBackgroundProcessor = new AwsBatchBackgroundProcessor(mockBatchRatchet, null);

    const res: SubmitJobCommandOutput = await svc.scheduleBackgroundTask('BACKGROUND_TASK_NAME', {}, {});
    expect(res).not.toBeNull();
  });
});

import { AwsBatchRatchet } from './aws-batch-ratchet.js';
import { SubmitJobCommandOutput } from '@aws-sdk/client-batch';
import { JestRatchet } from '@bitblit/ratchet-jest/lib/jest/jest-ratchet.js';
import { AwsBatchBackgroundProcessor } from './aws-batch-background-processor.js';
import { jest } from '@jest/globals';

let mockBatchRatchet: jest.Mocked<AwsBatchRatchet>;

describe('#AwsBatchBackgroundProcessor', () => {
  beforeEach(() => {
    mockBatchRatchet = JestRatchet.mock(jest.fn);
  });

  it('Should schedule background task', async () => {
    //mockBatchRatchet.defaultQueueName = 'a';
    mockBatchRatchet.scheduleJob.mockResolvedValue({ jobId: 'newID', jobName: 'name', $metadata: null });
    const svc: AwsBatchBackgroundProcessor = new AwsBatchBackgroundProcessor(mockBatchRatchet, null);

    const res: SubmitJobCommandOutput = await svc.scheduleBackgroundTask('BACKGROUND_TASK_NAME', {}, {});
    expect(res).not.toBeNull();
  });
});

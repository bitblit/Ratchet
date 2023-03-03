import { AwsBatchRatchet } from './aws-batch-ratchet';
import { SubmitJobCommandOutput } from '@aws-sdk/client-batch';
import { AwsBatchBackgroundProcessor } from './aws-batch-background-processor';
import { JestRatchet } from '../../jest/jest-ratchet';

let mockBatchRatchet: jest.Mocked<AwsBatchRatchet>;

describe('#AwsBatchBackgroundProcessor', () => {
  beforeEach(() => {
    mockBatchRatchet = JestRatchet.mock<AwsBatchRatchet>();
  });

  it('Should schedule background task', async () => {
    //mockBatchRatchet.defaultQueueName = 'a';
    mockBatchRatchet.scheduleJob.mockResolvedValue({ jobId: 'newID', jobName: 'name', $metadata: null });
    const svc: AwsBatchBackgroundProcessor = new AwsBatchBackgroundProcessor(mockBatchRatchet, null);

    const res: SubmitJobCommandOutput = await svc.scheduleBackgroundTask('BACKGROUND_TASK_NAME', {}, {});
    expect(res).not.toBeNull();
  });
});

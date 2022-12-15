import { AwsBatchRatchet } from './aws-batch-ratchet';
import { JobSummary, SubmitJobResponse } from 'aws-sdk/clients/batch';
import AWS from 'aws-sdk';
import { JestRatchet } from '../jest';

let mockBatch: jest.Mocked<AWS.Batch>;

describe('#AwsBatchService', () => {
  beforeEach(() => {
    mockBatch = JestRatchet.mock();
  });

  it('Should schedule background task', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.submitJob.mockReturnValue({
      promise: async () => Promise.resolve({ jobName: 'b' } as SubmitJobResponse),
    } as never);

    const res: SubmitJobResponse = await svc.scheduleBackgroundTask('BACKGROUND_TASK_NAME', {}, 'JOB-DEFINITION', 'QUEUE-NAME');
    expect(res).not.toBeNull();
  });

  it('Should schedule batch job', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.submitJob.mockReturnValue({
      promise: async () => Promise.resolve({ jobName: 'b' } as SubmitJobResponse),
    } as never);

    const res: SubmitJobResponse = await svc.scheduleJob({ jobName: 'testName', jobDefinition: 'testDefinition', jobQueue: 'testQueue' });
    expect(res).not.toBeNull();
  });

  it('Should list jobs', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.listJobs.mockReturnValue({
      promise: async () => Promise.resolve([{}] as JobSummary[]),
    } as never);

    const res: JobSummary[] = await svc.listJobs('testQueue');
    expect(res).not.toBeNull();
    expect(res.length).toEqual(1);
  });

  it('Should count jobs in state', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.listJobs.mockReturnValue({
      promise: async () => Promise.resolve([{}] as JobSummary[]),
    } as never);

    const res: number = await svc.jobCountInState('testStatus', 'testQueue');
    expect(res).toEqual(1);
  });
});

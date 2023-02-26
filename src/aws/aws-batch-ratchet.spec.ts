import { AwsBatchRatchet } from './aws-batch-ratchet';
import { Batch, JobStatus, JobSummary, SubmitJobCommandOutput } from '@aws-sdk/client-batch';
import { JestRatchet } from '../jest';

let mockBatch: jest.Mocked<Batch>;

describe('#AwsBatchService', () => {
  beforeEach(() => {
    mockBatch = JestRatchet.mock();
  });

  it('Should schedule background task', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.submitJob.mockResolvedValue({ jobName: 'b' } as never);

    const res: SubmitJobCommandOutput = await svc.scheduleBackgroundTask('BACKGROUND_TASK_NAME', {}, 'JOB-DEFINITION', 'QUEUE-NAME');
    expect(res).not.toBeNull();
  });

  it('Should schedule batch job', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.submitJob.mockResolvedValue({ jobName: 'b' } as never);

    const res: SubmitJobCommandOutput = await svc.scheduleJob({
      jobName: 'testName',
      jobDefinition: 'testDefinition',
      jobQueue: 'testQueue',
    });
    expect(res).not.toBeNull();
  });

  it('Should list jobs', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.listJobs.mockResolvedValue([{}] as JobSummary[] as never);

    const res: JobSummary[] = await svc.listJobs('testQueue');
    expect(res).not.toBeNull();
    expect(res.length).toEqual(1);
  });

  it('Should count jobs in state', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.listJobs.mockResolvedValue([{}] as JobSummary[] as never);

    const res: number = await svc.jobCountInState(JobStatus.RUNNABLE, 'testQueue');
    expect(res).toEqual(1);
  });
});

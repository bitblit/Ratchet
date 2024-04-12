import { AwsBatchRatchet } from './aws-batch-ratchet.js';
import { BatchClient, JobStatus, JobSummary, ListJobsCommand, SubmitJobCommand, SubmitJobCommandOutput } from '@aws-sdk/client-batch';
import { mockClient } from 'aws-sdk-client-mock';
import { expect, test, describe, vi, beforeEach } from 'vitest';

let mockBatch;

describe('#AwsBatchService', () => {
  mockBatch = mockClient(BatchClient);
  beforeEach(() => {
    mockBatch.reset();
  });

  test('Should schedule batch job', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.on(SubmitJobCommand).resolves({ jobName: 'b' });

    const res: SubmitJobCommandOutput = await svc.scheduleJob({
      jobName: 'testName',
      jobDefinition: 'testDefinition',
      jobQueue: 'testQueue',
    });
    expect(res).not.toBeNull();
  });

  test('Should list jobs', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.on(ListJobsCommand).resolves([{}] as JobSummary[]);

    const res: JobSummary[] = await svc.listJobs('testQueue');
    expect(res).not.toBeNull();
    expect(res.length).toEqual(1);
  });

  test('Should count jobs in state', async () => {
    const svc: AwsBatchRatchet = new AwsBatchRatchet(mockBatch);
    mockBatch.on(ListJobsCommand).resolves([{}] as JobSummary[]);

    const res: number = await svc.jobCountInState(JobStatus.RUNNABLE, 'testQueue');
    expect(res).toEqual(1);
  });
});

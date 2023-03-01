import {
  BatchClient,
  JobStatus,
  JobSummary,
  ListJobsCommand,
  ListJobsCommandInput,
  ListJobsCommandOutput,
  SubmitJobCommand,
  SubmitJobCommandInput,
  SubmitJobCommandOutput,
} from '@aws-sdk/client-batch';
import { DateTime } from 'luxon';
import { Logger, RequireRatchet } from '../common';

/**
 * Endpoints for doing api level integrations
 */
export class AwsBatchRatchet {
  constructor(private batch: BatchClient, private defaultQueueName?: string, private defaultJobDefinition?: string) {}

  public async scheduleJob(options: SubmitJobCommandInput): Promise<SubmitJobCommandOutput> {
    Logger.info('Submitting batch job %s', options.jobName);
    try {
      const rval: SubmitJobCommandOutput = await this.batch.send(new SubmitJobCommand(options));
      Logger.info('Job %s(%s) submitted', rval.jobName, rval.jobId);
      return rval;
    } catch (err) {
      Logger.error('Cannot submit batch job %s: %s', options.jobName, err);
    }
    return null;
  }

  public async jobCountInState(jobStatus: JobStatus, queueName: string = this.defaultQueueName): Promise<number> {
    const all: JobSummary[] = await this.listJobs(queueName, jobStatus);
    return all.length;
  }

  public async listJobs(queueName: string = this.defaultQueueName, jobStatus: JobStatus = null): Promise<JobSummary[]> {
    RequireRatchet.notNullOrUndefined(queueName, 'queueName');
    let rval: JobSummary[] = [];
    const request: ListJobsCommandInput = {
      jobQueue: queueName,
      jobStatus: jobStatus,
      nextToken: null,
    };
    Logger.info('Fetching %j', request);
    do {
      Logger.info('Pulling page...');
      const tmp: ListJobsCommandOutput = await this.batch.send(new ListJobsCommand(request));
      rval = rval.concat(tmp.jobSummaryList);
      request.nextToken = tmp.nextToken;
    } while (request.nextToken);

    return rval;
  }

  public async scheduleBackgroundTask(
    taskName: string,
    data: any = {},
    jobDefinition: string = this.defaultJobDefinition,
    queueName: string = this.defaultQueueName
  ): Promise<SubmitJobCommandOutput> {
    Logger.info('Submitting background task to AWS batch: %s %j %s', taskName, data, queueName);

    RequireRatchet.notNullOrUndefined(jobDefinition, 'jobDefinition');
    RequireRatchet.notNullOrUndefined(queueName, 'queueName');

    let rval: SubmitJobCommandOutput = null;

    const jobName: string = `${jobDefinition}-${taskName}_${DateTime.utc().toFormat('yyyy-MM-dd-HH-mm')}`;

    const options: SubmitJobCommandInput = {
      jobName,
      jobDefinition,
      jobQueue: queueName,
      parameters: {
        taskName,
        taskData: JSON.stringify(data),
        taskMetadata: '{}',
      },
    };

    try {
      rval = await this.batch.send(new SubmitJobCommand(options));
      Logger.info('Job %s(%s) submitted', rval.jobName, rval.jobId);
    } catch (err) {
      Logger.error(
        'Cannot submit batch job taskName: %s jobDef: %s queue: %s jobName: %s data: %j',
        taskName,
        jobDefinition,
        queueName,
        jobName,
        data,
        err
      );
    }

    return rval;
  }
}

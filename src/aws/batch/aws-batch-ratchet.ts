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
import {RequireRatchet} from "../../common/require-ratchet";
import {Logger} from '../../common/logger.js';

/**
 * Ratchet for simplifying interacting with AWS Batch
 */
export class AwsBatchRatchet {
  constructor(private _batchClient: BatchClient, private _defaultQueueName?: string, private _defaultJobDefinition?: string) {}

  public get batchClient(): BatchClient {
    return this._batchClient;
  }
  public get defaultQueueName(): string {
    return this._defaultQueueName;
  }
  public get defaultJobDefinition(): string {
    return this._defaultJobDefinition;
  }

  public async scheduleJob(options: SubmitJobCommandInput): Promise<SubmitJobCommandOutput> {
    Logger.info('Submitting batch job %s', options.jobName);
    try {
      const rval: SubmitJobCommandOutput = await this._batchClient.send(new SubmitJobCommand(options));
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
      const tmp: ListJobsCommandOutput = await this._batchClient.send(new ListJobsCommand(request));
      rval = rval.concat(tmp.jobSummaryList);
      request.nextToken = tmp.nextToken;
    } while (request.nextToken);

    return rval;
  }
}

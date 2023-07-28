import { SubmitJobCommandInput, SubmitJobCommandOutput } from '@aws-sdk/client-batch';
import { DateTime } from 'luxon';
import { AwsBatchRatchet } from './aws-batch-ratchet';
import {RequireRatchet} from "../../common/require-ratchet";
import { ErrorRatchet } from '../../common/error-ratchet';
import { Logger } from '../../common/logger';
import { StringRatchet } from '../../common/string-ratchet';

/**
 * Class to simplify using AWS batch as a background processor
 * (Primarily used by Epsilon)
 */
export class AwsBatchBackgroundProcessor {
  constructor(private batchRatchet: AwsBatchRatchet, private validTaskNames?: string[]) {
    RequireRatchet.notNullOrUndefined(this.batchRatchet, 'batchRatchet');
    RequireRatchet.notNullOrUndefined(this.batchRatchet.batchClient, 'batchRatchet.batchClient');
    RequireRatchet.notNullOrUndefined(this.batchRatchet.defaultJobDefinition, 'batchRatchet.defaultJobDefinition');
    RequireRatchet.notNullOrUndefined(this.batchRatchet.defaultQueueName, 'batchRatchet.defaultQueueName');
  }

  public async scheduleBackgroundTask(
    taskName: string,
    data: Record<string, any> = {},
    meta: Record<string, any> = {}
  ): Promise<SubmitJobCommandOutput> {
    if (
      this.validTaskNames &&
      this.validTaskNames.length &&
      (!StringRatchet.trimToNull(taskName) || !this.validTaskNames.includes(taskName))
    ) {
      ErrorRatchet.throwFormattedErr('Cannot start task %s - not found in valid task list', taskName);
    }

    Logger.info('Submitting background task to AWS batch: %s %j %s', taskName, data, this.batchRatchet.defaultQueueName);

    let rval: SubmitJobCommandOutput = null;

    const jobName: string = `${this.batchRatchet.defaultJobDefinition}-${taskName}_${DateTime.utc().toFormat('yyyy-MM-dd-HH-mm')}`;

    const options: SubmitJobCommandInput = {
      jobName: jobName,
      jobDefinition: this.batchRatchet.defaultJobDefinition,
      jobQueue: this.batchRatchet.defaultQueueName,
      parameters: {
        taskName,
        taskData: JSON.stringify(data),
        taskMetadata: JSON.stringify(meta),
      },
    };

    try {
      rval = await this.batchRatchet.scheduleJob(options);
      Logger.info('Job %s(%s) submitted', rval.jobName, rval.jobId);
    } catch (err) {
      Logger.error(
        'Cannot submit batch job taskName: %s jobDef: %s queue: %s jobName: %s data: %j',
        taskName,
        this.batchRatchet.defaultJobDefinition,
        this.batchRatchet.defaultQueueName,
        jobName,
        data,
        err
      );
    }

    return rval;
  }
}

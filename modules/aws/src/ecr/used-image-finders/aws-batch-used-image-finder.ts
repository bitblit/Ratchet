import { UsedImageFinder } from '../used-image-finder';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { Logger, RequireRatchet, StringRatchet } from '@bitblit/ratchet-common';
import {
  BatchClient,
  DescribeJobDefinitionsCommand,
  DescribeJobDefinitionsCommandInput,
  DescribeJobDefinitionsCommandOutput,
  JobDefinition,
  JobStatus,
  JobSummary,
  ListJobsCommand,
  ListJobsCommandInput,
  ListJobsCommandOutput,
} from '@aws-sdk/client-batch';

export class AwsBatchUsedImageFinder implements UsedImageFinder {
  constructor(private batch: BatchClient) {
    RequireRatchet.notNullOrUndefined(batch, 'batch');
  }
  public async findUsedImageUris(): Promise<string[]> {
    const jobs: JobDefinition[] = await this.listAllJobDefinitions(false);
    Logger.info('Found %d jobs', jobs.length);
    const tmp: string[] = jobs.map((j) => j.containerProperties.image).filter((s) => StringRatchet.trimToNull(s));
    const rval: string[] = Array.from(new Set<string>(tmp)); // remove dups
    return rval;
  }

  public async listAllJobDefinitions(includeInactive?: boolean): Promise<JobDefinition[]> {
    let rval: JobDefinition[] = [];
    const request: DescribeJobDefinitionsCommandInput = {
      nextToken: null,
      status: includeInactive ? undefined : 'ACTIVE',
    };
    do {
      const tmp: DescribeJobDefinitionsCommandOutput = await this.batch.send(new DescribeJobDefinitionsCommand(request));
      rval = rval.concat(tmp.jobDefinitions);
      request.nextToken = tmp.nextToken;
    } while (request.nextToken);

    return rval;
  }
}
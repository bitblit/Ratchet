import {
  CloudWatchLogsClient,
  DeleteLogGroupCommand,
  DeleteLogGroupCommandInput,
  DeleteLogStreamCommand,
  DescribeLogGroupsCommand,
  DescribeLogGroupsCommandInput,
  DescribeLogGroupsCommandOutput,
  DescribeLogStreamsCommand,
  DescribeLogStreamsCommandOutput,
  GetQueryResultsCommand,
  GetQueryResultsCommandOutput,
  LogGroup,
  LogStream,
  OrderBy,
  StartQueryCommand,
  StartQueryCommandInput,
  StartQueryCommandOutput,
  StopQueryCommand,
  StopQueryCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs';
import { Logger, PromiseRatchet, RequireRatchet, StringRatchet } from '@bitblit/ratchet-common';
import { injectable } from "tsyringe";

@injectable()
export class CloudWatchLogsRatchet {
  private static readonly MAX_DELETE_RETRIES = 5;
  private cwLogs: CloudWatchLogsClient;

  constructor(cloudwatchLogs: CloudWatchLogsClient = null) {
    this.cwLogs = cloudwatchLogs ? cloudwatchLogs : new CloudWatchLogsClient({ region: 'us-east-1' });
  }

  public get cloudWatchLogsClient(): CloudWatchLogsClient {
    return this.cwLogs;
  }

  public async removeEmptyOrOldLogStreams(
    logGroupName: string,
    maxToRemove = 1000,
    oldestEventEpochMS: number = null,
  ): Promise<LogStream[]> {
    Logger.info('Removing empty streams from %s, oldest event epoch MS : %d', logGroupName, oldestEventEpochMS);
    const streamSearchParams: any = {
      logGroupName: logGroupName,
      orderBy: OrderBy.LastEventTime,
    };

    const oldestEventTester: number = oldestEventEpochMS || 1;
    let totalStreams = 0;
    const removedStreams: LogStream[] = [];
    const failedRemovedStreams: LogStream[] = [];
    let waitPerDescribe = 10;

    do {
      Logger.debug('Executing search for streams');
      try {
        const streams: DescribeLogStreamsCommandOutput = await this.cwLogs.send(new DescribeLogStreamsCommand(streamSearchParams));
        totalStreams += streams.logStreams.length;

        Logger.debug('Found %d streams (%d so far, %d to delete)', streams.logStreams.length, totalStreams, removedStreams.length);

        for (let i = 0; i < streams.logStreams.length && removedStreams.length < maxToRemove; i++) {
          const st: LogStream = streams.logStreams[i];
          if (!st.firstEventTimestamp) {
            removedStreams.push(st);
          } else if (st.lastEventTimestamp < oldestEventTester) {
            removedStreams.push(st);
          }
        }

        streamSearchParams['nextToken'] = streams.nextToken;
      } catch (err) {
        const oldWait: number = waitPerDescribe;
        waitPerDescribe = Math.min(1000, waitPerDescribe * 1.5);
        Logger.info('Caught while describing %s, increasing wait between deletes (was %d, now %d)', err, oldWait, waitPerDescribe);
      }
    } while (!!streamSearchParams['nextToken'] && removedStreams.length < maxToRemove);

    Logger.info('Found %d streams to delete', removedStreams.length);
    let waitPer = 10;

    for (let i = 0; i < removedStreams.length; i++) {
      const delParams = {
        logGroupName: logGroupName,
        logStreamName: removedStreams[i].logStreamName,
      };

      const type: string = removedStreams[i].storedBytes === 0 ? 'empty' : 'old';
      Logger.info('Removing %s stream %s', type, removedStreams[i].logStreamName);
      let removed = false;
      let retry = 0;
      while (!removed && retry < CloudWatchLogsRatchet.MAX_DELETE_RETRIES) {
        try {
          await this.cwLogs.send(new DeleteLogStreamCommand(delParams));
          removed = true;
          await PromiseRatchet.wait(waitPer);
        } catch (err) {
          retry++;
          const oldWait: number = waitPer;
          waitPer = Math.min(1000, waitPer * 1.5);
          Logger.info(
            'Caught %s, increasing wait between deletes and retrying (wait was %d, now %d) (Retry %d of %d)',
            err,
            oldWait,
            waitPer,
            retry,
            CloudWatchLogsRatchet.MAX_DELETE_RETRIES,
          );
        }
      }
      if (!removed) {
        // Ran out of retries
        failedRemovedStreams.push(removedStreams[i]);
      }
    }

    Logger.warn('Failed to remove streams : %j', failedRemovedStreams);
    return removedStreams;
  }

  public async findOldestEventTimestampInGroup(logGroupName: string): Promise<number> {
    const stream: LogStream = await this.findStreamWithOldestEventInGroup(logGroupName);
    return stream ? stream.firstEventTimestamp : null;
  }

  public async findStreamWithOldestEventInGroup(logGroupName: string): Promise<LogStream> {
    Logger.info('Finding oldest event in : %s', logGroupName);
    let rval: LogStream = null;
    try {
      const streamSearchParams = {
        logGroupName: logGroupName,
        orderBy: OrderBy.LastEventTime,
      };

      let totalStreams = 0;
      do {
        Logger.debug('Executing search for streams');
        const streams: DescribeLogStreamsCommandOutput = await this.cwLogs.send(new DescribeLogStreamsCommand(streamSearchParams));
        totalStreams += streams.logStreams.length;

        Logger.debug('Found %d streams (%d so far)', streams.logStreams.length, totalStreams);

        streams.logStreams.forEach((s) => {
          if (s.firstEventTimestamp && (rval === null || s.firstEventTimestamp < rval.firstEventTimestamp)) {
            rval = s;
          }
        });

        streamSearchParams['nextToken'] = streams.nextToken;
      } while (!!streamSearchParams['nextToken']);
    } catch (err) {
      Logger.error('Error attempting to find oldest event in group : %s : %s', logGroupName, err, err);
    }
    return rval;
  }

  public async findLogGroups(prefix: string): Promise<LogGroup[]> {
    RequireRatchet.notNullOrUndefined(prefix);

    const params: DescribeLogGroupsCommandInput = {
      logGroupNamePrefix: prefix,
    };
    let rval: LogGroup[] = [];

    do {
      Logger.info('%d found, pulling log groups : %j', rval.length, params);
      const res: DescribeLogGroupsCommandOutput = await this.cwLogs.send(new DescribeLogGroupsCommand(params));
      rval = rval.concat(res.logGroups);
      params.nextToken = res.nextToken;
    } while (!!params.nextToken);

    return rval;
  }

  public async removeLogGroups(groups: LogGroup[]): Promise<boolean[]> {
    RequireRatchet.notNullOrUndefined(groups);
    const rval: boolean[] = [];

    for (let i = 0; i < groups.length; i++) {
      try {
        Logger.info('Deleting %j', groups[i]);
        const req: DeleteLogGroupCommandInput = {
          logGroupName: groups[i].logGroupName,
        };
        await this.cwLogs.send(new DeleteLogGroupCommand(req));
        rval.push(true);
      } catch (err) {
        Logger.error('Failure to delete %j : %s', groups[i], err);
        rval.push(false);
      }
    }

    return rval;
  }

  public async removeLogGroupsWithPrefix(prefix: string): Promise<boolean[]> {
    RequireRatchet.notNullOrUndefined(prefix);
    RequireRatchet.true(StringRatchet.trimToEmpty(prefix).length > 0); // Don't allow nuke all here

    Logger.info('Removing log groups with prefix %s', prefix);
    const groups: LogGroup[] = await this.findLogGroups(prefix);
    return await this.removeLogGroups(groups);
  }

  public async fullyExecuteInsightsQuery(sqr: StartQueryCommandInput): Promise<GetQueryResultsCommandOutput> {
    RequireRatchet.notNullOrUndefined(sqr);
    Logger.debug('Starting insights query : %j', sqr);
    const resp: StartQueryCommandOutput = await this.cwLogs.send(new StartQueryCommand(sqr));
    Logger.debug('Got query id %j', resp);

    let rval: GetQueryResultsCommandOutput = null;
    let delayMS: number = 100;
    while (!rval || ['Running', 'Scheduled'].includes(rval.status)) {
      rval = await this.cwLogs.send(new GetQueryResultsCommand({ queryId: resp.queryId }));
      await PromiseRatchet.wait(delayMS);
      delayMS *= 2;
      Logger.info('Got : %j', rval);
    }
    return rval;
  }

  public async abortInsightsQuery(queryId: string): Promise<StopQueryCommandOutput> {
    let rval: StopQueryCommandOutput = null;
    if (!!queryId) {
      rval = await this.cwLogs.send(new StopQueryCommand({ queryId: queryId }));
    }
    return rval;
  }
}

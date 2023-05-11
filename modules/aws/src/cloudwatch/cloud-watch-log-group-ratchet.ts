import {
  CloudWatchLogsClient,
  DescribeLogStreamsCommand,
  DescribeLogStreamsCommandInput,
  DescribeLogStreamsCommandOutput,
  FilteredLogEvent,
  FilterLogEventsCommand,
  FilterLogEventsCommandInput,
  FilterLogEventsCommandOutput,
  LogStream,
} from '@aws-sdk/client-cloudwatch-logs';
import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';
import { StopWatch } from '@bitblit/ratchet-common/lib/lang/stop-watch.js';

export class CloudWatchLogGroupRatchet {
  constructor(private logGroup: string, private awsCWLogs: CloudWatchLogsClient = new CloudWatchLogsClient({ region: 'us-east-1' })) {}

  public get cloudWatchLogsClient(): CloudWatchLogsClient {
    return this.awsCWLogs;
  }
  public async readLogStreams(startTimestamp: number = null, endTimestamp: number = null): Promise<LogStream[]> {
    const params: DescribeLogStreamsCommandInput = {
      logGroupName: this.logGroup,
      // logStreamNamePrefix: prefix,
      orderBy: 'LastEventTime',
    };

    const rval: LogStream[] = [];

    do {
      Logger.debug('Pulling more log streams (%d found so far)', rval.length);
      const temp: DescribeLogStreamsCommandOutput = await this.awsCWLogs.send(new DescribeLogStreamsCommand(params));

      temp.logStreams.forEach((s) => {
        if (s.lastEventTimestamp !== null) {
          if (!startTimestamp || s.lastEventTimestamp >= startTimestamp) {
            if (!endTimestamp || s.firstEventTimestamp <= endTimestamp) {
              rval.push(s);
            }
          }
        }
      });

      params.nextToken = temp.nextToken;
    } while (!!params.nextToken);

    Logger.debug('Found %d total, returning', rval.length);
    return rval;
  }

  public async readLogStreamNames(startTimestamp: number = null, endTimestamp: number = null): Promise<string[]> {
    const streams: LogStream[] = await this.readLogStreams(startTimestamp, endTimestamp);
    const rval: string[] = streams.map((s) => s.logStreamName);
    return rval;
  }

  public async readEvents(
    filter: string,
    startTimestamp: number = null,
    endTimestamp: number = null,
    sortEvents = true,
    maxEvents: number = null
  ): Promise<FilteredLogEvent[]> {
    const sw: StopWatch = new StopWatch();
    const params: FilterLogEventsCommandInput = {
      logGroupName: this.logGroup,
      endTime: endTimestamp,
      startTime: startTimestamp,
    };

    if (filter) {
      params.filterPattern = filter;
    }

    Logger.debug('Reading log events matching : %j', params);

    let rval: FilteredLogEvent[] = [];

    do {
      Logger.debug('Pulling more log events (%d found so far) : %s', rval.length, sw.dump());
      const temp: FilterLogEventsCommandOutput = await this.awsCWLogs.send(new FilterLogEventsCommand(params));
      rval = rval.concat(temp.events);
      params.nextToken = temp.nextToken;
    } while (!!params.nextToken && (!maxEvents || rval.length < maxEvents));

    Logger.debug('Found %d total in %s', rval.length, sw.dump());

    if (sortEvents) {
      Logger.debug('Sorting events by timestamp');
      rval = rval.sort((a, b) => {
        let rval = a.timestamp - b.timestamp;
        if (rval === 0) {
          rval = a.message.localeCompare(b.message);
        }
        return rval;
      });
    }

    sw.log();
    return rval;
  }
}

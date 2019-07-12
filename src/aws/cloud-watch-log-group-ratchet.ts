/*
    Service for interacting with a specific CloudWatch log group
*/

import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';
import {
    DescribeLogStreamsResponse,
    FilteredLogEvent,
    FilterLogEventsResponse,
    LogStream
} from 'aws-sdk/clients/cloudwatchlogs';

export class CloudWatchLogGroupRatchet {
    constructor(private logGroup: string, private awsCWLogs: AWS.CloudWatchLogs = new AWS.CloudWatchLogs({region: 'us-east-1'})) {
    }


    public async readLogStreams(startTimestamp: number = null, endTimestamp: number = null) : Promise<LogStream[]>
    {

        let params : any =
            {
                logGroupName : this.logGroup,
                // logStreamNamePrefix: prefix,
                orderBy: 'LastEventTime'
            };

        const rval: LogStream[] = [];

        do {
            Logger.debug('Pulling more log streams (%d found so far)', rval.length);
            const temp: DescribeLogStreamsResponse = await this.awsCWLogs.describeLogStreams(params).promise();

            temp.logStreams.forEach(  s=> {
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

    public async readLogStreamNames(startTimestamp: number = null, endTimestamp: number = null) : Promise<string[]>
    {
        const streams: LogStream[] = await this.readLogStreams(startTimestamp, endTimestamp);
        const rval: string[] = streams.map(s=>s.logStreamName);
        return rval;
    }

    public async readEvents(filter: string, startTimestamp: number=null, endTimestamp: number=null, sortEvents: boolean = true,
                            maxEvents: number = null): Promise<FilteredLogEvent[]> {
        let params : any =
            {
                logGroupName : this.logGroup,
                endTime: endTimestamp,
                startTime: startTimestamp,
            };

        if (filter) {
            params.filterPattern = filter;
        }

        Logger.debug('Reading log events matching : %j', params);

        let rval: FilteredLogEvent[] = [];

        do {
            Logger.info('Pulling more log events (%d found so far)', rval.length);
            const temp: FilterLogEventsResponse = await this.awsCWLogs.filterLogEvents(params).promise();
            rval = rval.concat(temp.events);
            params.nextToken = temp.nextToken;
        } while (!!params.nextToken && (!maxEvents || rval.length < maxEvents));

        Logger.debug('Found %d total', rval.length);

        if (sortEvents) {
            Logger.debug('Sorting events by timestamp');
            rval = rval.sort((a,b) => {
                let rval = a.timestamp - b.timestamp;
                if (rval === 0) {
                    rval = a.message.localeCompare(b.message);
                }
                return rval;
            });
        }

        return rval;
    }

}

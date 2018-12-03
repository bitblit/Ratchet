/*
    Service for interacting with cloudwatch
*/

import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';
import {DescribeLogStreamsResponse, LogStream} from 'aws-sdk/clients/cloudwatchlogs';

export class CloudWatchRatchet {
    private cwLogs: AWS.CloudWatchLogs;

    constructor(cloudwatchLogs: AWS.CloudWatchLogs = null) {
        this.cwLogs = (cloudwatchLogs) ? cloudwatchLogs : new AWS.CloudWatchLogs({region: 'us-east-1'});
    }

    public async removeEmptyOrOldLogStreams(logGroupName: string, maxToRemove: number = 1000, oldestEventEpochMS:number = null): Promise<LogStream[]> {
        Logger.info('Removing empty streams from %s, oldest event epoch MS : %d', logGroupName, oldestEventEpochMS);
        let streamSearchParams:any = {
            logGroupName: logGroupName,
            orderBy: 'LastEventTime'
        };

        let oldestEventTester: number = oldestEventEpochMS || 1;
        let totalStreams: number = 0;
        let removedStreams: LogStream[] = [];

        do {
            Logger.debug('Executing search for streams');
            const streams: DescribeLogStreamsResponse = await this.cwLogs.describeLogStreams(streamSearchParams).promise();
            totalStreams += streams.logStreams.length;

            Logger.debug('Found %d streams (%d so far, %d to delete)', streams.logStreams.length, totalStreams, removedStreams.length);

            for (let i=0;i<streams.logStreams.length &&  removedStreams.length < maxToRemove;i++) {
                const st: LogStream = streams.logStreams[i];
                if (!st.firstEventTimestamp) {
                    removedStreams.push(st);
                } else if (st.lastEventTimestamp < oldestEventTester) {
                    removedStreams.push(st);
                }
            }

            streamSearchParams['nextToken'] = streams.nextToken;
        } while (!!streamSearchParams['nextToken'] && removedStreams.length < maxToRemove)

        Logger.info('Found %d streams to delete', removedStreams.length);

        for (let i=0;i<removedStreams.length;i++) {
            let delParams = {
                logGroupName: logGroupName,
                logStreamName: removedStreams[i].logStreamName
            };

            Logger.info('Removing empty stream %s', removedStreams[i].logStreamName);
            const result: any = await this.cwLogs.deleteLogStream(delParams).promise();
        }

        return removedStreams;
    }

    public async findOldestEventTimestampInGroup(logGroupName: string): Promise<number> {
        const stream: LogStream = await this.findStreamWithOldestEventInGroup(logGroupName);
        return (stream)? stream.firstEventTimestamp : null;
    }

    public async findStreamWithOldestEventInGroup(logGroupName: string): Promise<LogStream> {
        Logger.info('Finding oldest event in : %s', logGroupName);
        let rval: LogStream = null;
        try {

            var streamSearchParams = {
                logGroupName: logGroupName,
                orderBy: 'LastEventTime'
            };

            let totalStreams: number = 0;
            do {
                Logger.debug('Executing search for streams');
                const streams: DescribeLogStreamsResponse = await this.cwLogs.describeLogStreams(streamSearchParams).promise();
                totalStreams += streams.logStreams.length;

                Logger.debug('Found %d streams (%d so far)', streams.logStreams.length, totalStreams);

                streams.logStreams.forEach( s => {
                    if (s.firstEventTimestamp && (rval === null || s.firstEventTimestamp < rval.firstEventTimestamp)) {
                        rval = s;
                    }
                });

                streamSearchParams['nextToken'] = streams.nextToken;
            } while (!!streamSearchParams['nextToken'])


        } catch (err) {
            Logger.error('Error attempting to find oldest event in group : %s : %s', logGroupName, err, err);

        }
        return rval;
    }



}

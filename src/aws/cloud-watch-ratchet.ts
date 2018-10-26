/*
    Service for interacting with cloudwatch
*/

import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';

export class CloudWatchRatchet {
    private cwLogs: AWS.CloudWatchLogs;

    constructor(cloudwatchLogs: AWS.CloudWatchLogs = null) {
        this.cwLogs = (cloudwatchLogs) ? cloudwatchLogs : new AWS.CloudWatchLogs({region: 'us-east-1'});
    }

    public removeEmptyLogStreams(logGroupName: string, nextToken: string = null): Promise<any> {
        Logger.info('Removing empty streams from %s, token : %s', logGroupName, nextToken);
        var params = {
            logGroupName: logGroupName,
            orderBy: 'LastEventTime'
        };
        if (nextToken) {
            params['nextToken'] = nextToken;
        }

        return this.cwLogs.describeLogStreams(params).promise().then(streams => {
            let shouldContinue: boolean = true;
            let allPromises: Promise<any>[] = [];
            if (streams != null && streams.logStreams != null) {
                streams.logStreams.forEach(ls => {
                    if (ls.firstEventTimestamp == undefined && ls.logStreamName != null) {

                        let delParams = {
                            logGroupName: logGroupName,
                            logStreamName: ls.logStreamName
                        };

                        Logger.info('Removing empty stream %s', ls.logStreamName);
                        allPromises.push(this.cwLogs.deleteLogStream(delParams).promise());
                    }
                    else {
                        shouldContinue = false;
                    }
                });
                if (shouldContinue && streams.nextToken) {
                    allPromises.push(this.removeEmptyLogStreams(logGroupName, streams.nextToken));
                }
            }

            return Promise.all(allPromises);
        });
    }

}

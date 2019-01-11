/*
    Helper functions for DynamoDB
*/


import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';
import {PromiseResult} from 'aws-sdk/lib/request';
import {DurationRatchet} from '../common/duration-ratchet';

export class DynamoRatchet {

    constructor(private awsDDB: AWS.DynamoDB.DocumentClient) {
        if (!awsDDB) {
            throw ('awsDDB may not be null');
        }
    }


    public getDDB(): AWS.DynamoDB.DocumentClient {
        return this.awsDDB;
    }


    public async fullyExecuteQuery<T>(qry: any, delayMS: number = 250) : Promise<T[]> {
        try {
            Logger.debug('Executing query : %j', qry);
            const start: number = new Date().getTime();

            let rval: T[] = [];

            Logger.info("Pulling %j", qry);

            let qryResults: PromiseResult<any, any> = await this.awsDDB.query(qry).promise();
            rval = rval.concat(qryResults.Items as T[]);

            while (qryResults.LastEvaluatedKey) {
                Logger.debug('Found more rows - requery with key %j', qryResults.LastEvaluatedKey);
                qry['ExclusiveStartKey'] = qryResults.LastEvaluatedKey;
                qryResults = await this.awsDDB.query(qry).promise();
                rval = rval.concat(qryResults.Items);
                Logger.info('Rval is now %d items', rval.length);
            }

            const end: number = new Date().getTime();

            Logger.info('Finished, returned %d results in %s for %j', rval.length, DurationRatchet.formatMsDuration(end - start, true), qry);
            return rval;
        }
        catch (err) {
            Logger.error('Failed with %s, q: %j',err, qry, err);
            return [];
        }

    }

    public async fullyExecuteScan<T>(qry: any, delayMS: number = 250) : Promise<T[]> {
        try {
            Logger.debug('Executing scan : %j', qry);
            const start: number = new Date().getTime();

            let rval: T[] = [];

            Logger.info("Pulling %j", qry);

            let qryResults: PromiseResult<any, any> = await this.awsDDB.scan(qry).promise();
            rval = rval.concat(qryResults.Items as T[]);

            while (qryResults.LastEvaluatedKey) {
                Logger.debug('Found more rows - requery with key %j', qryResults.LastEvaluatedKey);
                qry['ExclusiveStartKey'] = qryResults.LastEvaluatedKey;
                qryResults = await this.awsDDB.query(qry).promise();
                rval = rval.concat(qryResults.Items);
                Logger.info('Rval is now %d items', rval.length);
            }

            const end: number = new Date().getTime();

            Logger.info('Finished, returned %d results in %s for %j', rval.length, DurationRatchet.formatMsDuration(end - start, true), qry);
            return rval;
        }
        catch (err) {
            Logger.error('Failed with %s, q: %j',err, qry, err);
            return [];
        }

    }


}
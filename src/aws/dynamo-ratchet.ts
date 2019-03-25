/*
    Helper functions for DynamoDB
*/


import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';
import {PromiseResult} from 'aws-sdk/lib/request';
import {DurationRatchet} from '../common/duration-ratchet';
import {BatchWriteItemOutput} from 'aws-sdk/clients/dynamodb';
import {AWSError} from 'aws-sdk';

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

    public async writeAllInBatches<T>(elements: T[], tableName: string, batchSize: number): Promise<number> {
        if (!batchSize || batchSize<2) {
            throw new Error('Batch size needs to be at least 2, was '+batchSize);
        }

        let rval: number = 0;
        if (!!elements && elements.length > 0) {
            let batchItems: any[] = [];
            elements.forEach(el => {
                batchItems.push(
                    {
                        PutRequest: {
                            Item: el,
                            ReturnConsumedCapacity: 'TOTAL',
                            TableName: tableName
                        }
                    });
            });
            Logger.info('Processing %d batch items to %s', batchItems.length, tableName);

            while (batchItems.length > 0) {
                const curBatch: any[] = batchItems.slice(0, Math.min(batchItems.length, batchSize));
                batchItems = batchItems.slice(curBatch.length);
                const params: any = {
                    RequestItems: {},
                    ReturnConsumedCapacity: 'TOTAL',
                    ReturnItemCollectionMetrics: 'SIZE'
                };
                params.RequestItems[tableName] = curBatch;

                const batchResults: PromiseResult<BatchWriteItemOutput, AWSError> = await this.awsDDB.batchWrite(params).promise();
                rval += curBatch.length;
                Logger.debug('%d Remain, Batch Results : %j', batchItems.length, batchResults);
            }
        }
        return rval;
    }


}
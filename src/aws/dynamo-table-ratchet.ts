/*
    Helper functions for DynamoDB tables - existence, status, etc.
*/


import * as AWS from 'aws-sdk';
import {Logger} from '../common/logger';
import {
    CreateTableInput,
    CreateTableOutput,
    DeleteTableInput,
    DeleteTableOutput,
    DescribeTableOutput
} from 'aws-sdk/clients/dynamodb';
import {RequireRatchet} from '../common/require-ratchet';
import {PromiseRatchet} from '../common/promise-ratchet';
import {ErrorRatchet} from '../common/error-ratchet';

export class DynamoTableRatchet {

    constructor(private awsDDB: AWS.DynamoDB) {
        if (!awsDDB) {
            throw ('awsDDB may not be null');
        }
    }

    public async deleteTable(tableName: string, waitForDelete: boolean = true): Promise<DeleteTableOutput> {
        RequireRatchet.notNullOrUndefined(tableName);
        const input: DeleteTableInput = {
            TableName: tableName
        };
        Logger.debug('Deleting ddb table %s', tableName);
        const rval:DeleteTableOutput = await this.awsDDB.deleteTable(input).promise();

        if (waitForDelete) {
            Logger.debug('Table marked for delete, waiting for deletion');
            await this.waitForTableDelete(tableName);
        }

        return rval;
    }


    public async createTable(input: CreateTableInput, waitForReady: boolean = true, replaceIfExists: boolean = false): Promise<CreateTableOutput> {
        RequireRatchet.notNullOrUndefined(input);
        RequireRatchet.notNullOrUndefined(input.TableName);

        Logger.debug('Creating new table : %j', input);
        const exists: boolean = await this.tableExists(input.TableName);

        if (exists) {
            if (replaceIfExists) {
                Logger.debug('Table %s exists and replace specified - deleting', input.TableName);
                await this.deleteTable(input.TableName);
            } else {
                ErrorRatchet.throwFormattedErr('Cannot create table %s - exists already and replace not specified',
                    input.TableName);
            }
        }

        const rval:CreateTableOutput = await this.awsDDB.createTable(input).promise();

        if (waitForReady) {
            Logger.debug('Table created, awaiting ready');
            await this.waitForTableReady(input.TableName);
        }

        return rval;
    }

    public async waitForTableReady(tableName: string): Promise<boolean> {
        let rval: boolean = true;
        let out: DescribeTableOutput = await this.safeDescribeTable(tableName);

        while (!!out && !!out.Table && out.Table.TableStatus!=='ACTIVE') {
            Logger.silly('Table not ready - waiting 2 seconds');
            await PromiseRatchet.wait(2000);
            out = await this.safeDescribeTable(tableName);
        }

        if (!out && !out.Table) {
            Logger.warn('Cannot wait for %s to be ready - table does not exist', tableName);
            rval = false;
        }

        return rval;
    }


    public async waitForTableDelete(tableName: string): Promise<void> {
        let out: DescribeTableOutput = await this.safeDescribeTable(tableName);

        while (!!out) {
            Logger.silly('Table %s still exists, waiting 2 seconds (State is %s)', tableName, out.Table.TableStatus);
            await PromiseRatchet.wait(2000);
            out = await this.safeDescribeTable(tableName);
        }
    }


    public async tableExists(tableName: string): Promise<boolean> {
        const desc: DescribeTableOutput = await this.safeDescribeTable(tableName);
        return !!desc;
    }

    public async safeDescribeTable(tableName: string): Promise<DescribeTableOutput> {
        try {
            const out: DescribeTableOutput = await this.awsDDB.describeTable({TableName: tableName}).promise();
            return out;
        } catch (err) {
            if (!!err.code && err.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw err;
            }
        }
    }


}

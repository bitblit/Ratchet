import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import {DynamoRatchet} from '../../src/aws/dynamo-ratchet';
import {Logger} from '../../src/common/logger';
import {RuntimeParameterRatchet, StoredRuntimeParameter} from '../../src/aws/runtime-parameter-ratchet';
import {PromiseRatchet} from '../../src/common/promise-ratchet';

describe('#runtimeParameterRatchet', function() {
    xit('fetch and cache a runtime parameter', async() => {

        Logger.setLevelByName('silly');
        const dynamo: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({region: 'us-east-1'}));
        const tableName: string = 'default-table';

        const rpr: RuntimeParameterRatchet = new RuntimeParameterRatchet(dynamo, tableName);

        const stored: StoredRuntimeParameter = await rpr.storeParameter('test','test1',15, 5);
        Logger.info('Stored : %j', stored);

        const cache1: number = await rpr.fetchParameter<number>('test','test1');
        const cache1a: number = await rpr.fetchParameter<number>('test','test1');
        const cache1b: number = await rpr.fetchParameter<number>('test','test1');
        expect(cache1).to.eq(15);
        expect(cache1a).to.eq(15);
        expect(cache1b).to.eq(15);

        await PromiseRatchet.wait(6000);

        const cache2: number = await rpr.fetchParameter<number>('test','test1');
        expect(cache2).to.eq(15);

        const cacheMiss: number = await rpr.fetchParameter<number>('test','test-miss');
        expect(cacheMiss).to.be.null

        const cacheDefault: number = await rpr.fetchParameter<number>('test','test-miss', 27);
        expect(cacheDefault).to.eq(27);

    });


});

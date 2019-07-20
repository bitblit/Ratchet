import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import {DynamoRatchet} from '../../src/aws/dynamo-ratchet';
import {Logger} from '../../src/common/logger';

describe('#atomicCounter', function() {
    it('should increment the counter and return the new value', async() => {
        const dr: DynamoRatchet = new DynamoRatchet(new AWS.DynamoDB.DocumentClient({region: 'us-east-1'}));
        const tableName: string ='xxx';
        const res: number = await dr.atomicCounter(tableName, {groupId: 'global', unitId: 'sequence'}, 'lastValue',1);
        Logger.info('Got : %s', res);
        expect(res).to.not.be.null;
    });

});
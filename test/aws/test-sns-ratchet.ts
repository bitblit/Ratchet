import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import * as AWS from 'aws-sdk';
import {S3CacheRatchet} from '../../src/aws/s3-cache-ratchet';
import {SnsRatchet} from '../../src/aws/sns-ratchet';
import {PublishResponse} from 'aws-sdk/clients/sns';

describe('#SNSRatchet', function() {
    it('should send a message', async() => {
        this.bail();

        /*
        let sns: AWS.SNS = new AWS.SNS({apiVersion: '2010-03-31', region: 'us-east-1'});
        const topicArn: string = 'TOPIC-ARN-HERE';
        let ratchet: SnsRatchet = new SnsRatchet(sns, topicArn);
        const out: PublishResponse = await ratchet.sendMessage('test \n\n'+new Date()+'\n\n---\n\nTest CR');

        expect(out).to.not.be.null;
        */

    });

});
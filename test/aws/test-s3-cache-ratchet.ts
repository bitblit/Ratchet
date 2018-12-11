import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import * as AWS from 'aws-sdk';
import {S3CacheRatchet} from '../../src/aws/s3-cache-ratchet';

describe('#fileExists', function() {
    it('should return false for files that do not exist', async() => {
        this.bail();
        /*
        let s3: AWS.S3 = new AWS.S3({region: 'us-east-1'});
        let cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket' );
        const out: boolean = await cache.fileExists('test-missing-file');

        expect(out).to.equal(false);
        */
    });

});
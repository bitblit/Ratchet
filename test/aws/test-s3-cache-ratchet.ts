import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import {S3CacheRatchet} from '../../src/aws/s3-cache-ratchet';
import {Logger} from '../../src/common/logger';

describe('#fileExists', function() {
    xit('should return false for files that do not exist', async() => {
        let s3: AWS.S3 = new AWS.S3({region: 'us-east-1'});
        let cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket' );
        const out: boolean = await cache.fileExists('test-missing-file');

        expect(out).to.equal(false);
    });

    xit('should create a expiring link', async() => {
        let s3: AWS.S3 = new AWS.S3({region: 'us-east-1'});
        let cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket' );
        const out: string = await cache.createDownloadLink('test.jpg',300);

        Logger.info('Got: %s', out);
        expect(out).to.not.be.null;
    });

});

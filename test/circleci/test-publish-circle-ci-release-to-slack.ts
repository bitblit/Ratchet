import { expect } from 'chai';
import {Logger} from '../../src/common/logger';
import {PublishCircleCiReleaseToSlack} from '../../src/circleci/publish-circle-ci-release-to-slack';

describe('#publishCircleCiReleaseToSlack', function() {
    it('should fail if not in a circle ci environment', async() => {
        try {
            const result:string = await PublishCircleCiReleaseToSlack.process('https://testslack.erigir.com');
            this.bail();
        } catch (err) {
            Logger.debug('Caught expected error : %s', err);
            // Expected, return ok
        }
    });

    /*
    it('should not fail if in a circle ci environment', async() => {
        process.env['CIRCLE_BUILD_NUM'] = '1';
        process.env['CIRCLE_BRANCH']='B';
        process.env['CIRCLE_TAG']='T';
        process.env['CIRCLE_SHA1']='S';
        process.env['CIRCLE_USERNAME']='cweiss';
        process.env['CIRCLE_PROJECT_REPONAME']='tester';


        const result:string = await PublishCircleCiReleaseToSlack.process('slackUrlHere');
        expect(result).to.eq('ok');

    });
     */

});
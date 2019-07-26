import {expect} from 'chai';
import {Logger} from '../../src/common/logger';
import {CloudWatchLogsRatchet} from '../../src/aws/cloud-watch-logs-ratchet';
import {LogGroup} from 'aws-sdk/clients/cloudwatchlogs';

describe('#cloudWatchLogsRatchet', function() {
    this.timeout(3000000);
    it('should find all matching groups', async() => {
        this.bail();
        /*
        const cw: CloudWatchLogsRatchet = new CloudWatchLogsRatchet();
        const prefix: string = '/';

        const res: LogGroup[] = await cw.findLogGroups(prefix);
        expect(res).to.not.be.null;

        Logger.info('Got : %j',res);
        */
    });

});
import { expect } from 'chai';
import {LambdaExpressRatchet} from '../../../src/aws/express/lambda-express-ratchet';
import {CloudWatchLogsRatchet} from '../../../src/aws/cloud-watch-ratchet';
import {Logger} from '../../../src/common/logger';
import {LogStream} from 'aws-sdk/clients/cloudwatchlogs';

describe('#parseExtractIps', function() {
    this.timeout(30000000);
    /*
    it('should parse the ip address list', function() {
        const req : any = {
            apiGateway: {
                event: {
                    headers: {
                        'X-Forwarded-For': '1.2.3.4, 5.6.7.8'
                    }
                }
            }
        };

        const chain = LambdaExpressRatchet.ipAddressChain(req);
        const ip = LambdaExpressRatchet.ipAddress(req);

        expect(ip).to.equal('1.2.3.4');
        expect(chain.length).to.equal(2);
        expect(chain[1]).to.equal('5.6.7.8');
    });
    */

    it('xxx', async() => {
        Logger.setLevelByName('debug');
        const cwr: CloudWatchLogsRatchet = new CloudWatchLogsRatchet();
        //const oldest: LogStream = await cwr.findStreamWithOldestEventInGroup('/aws/lambda/NeonProd-NeonJS-XEJS4I89JKTL');
        //Logger.info('Found : %j, first is %s', oldest, new Date(oldest.firstEventTimestamp));

        const removed: LogStream[] = await cwr.removeEmptyOrOldLogStreams('/aws/lambda/NeonProd-NeonJS-XEJS4I89JKTL', 10000, 1538265600000);
        Logger.info('Removed: %j', removed);
    });

});
import { expect } from 'chai';
import {APIGatewayEvent} from 'aws-lambda';
import {Request} from 'express';
import {LambdaExpressRatchet} from '../../../src/aws/express/lambda-express-ratchet';

describe('#parseExtractIps', function() {
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

});
import { expect } from 'chai';
import { SendSSHPublicKeyResponse } from 'aws-sdk/clients/ec2instanceconnect';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger } from '../../src/common/logger';
import { Instance } from 'aws-sdk/clients/ec2';
import { Ec2Ratchet } from '../../src/aws';

describe('#EC2Ratchet', function () {
  xit('should send a public key', async () => {
    const ratchet: Ec2Ratchet = new Ec2Ratchet();
    const instId: string = 'i-replace_me';
    const pubKey: string = fs.readFileSync(path.join(os.homedir(), '.ssh/id_rsa.pub')).toString();

    const res: SendSSHPublicKeyResponse = await ratchet.sendPublicKeyToEc2Instance(instId, pubKey);

    Logger.info('Got : %j', res);
    expect(res).to.not.be.null;
  });

  xit('should list instances', async () => {
    const ratchet: Ec2Ratchet = new Ec2Ratchet();

    const res: Instance[] = await ratchet.listAllInstances();

    Logger.info('Got : %j', res);
    expect(res).to.not.be.null;
    expect(res.length).to.be.gt(1);
  });

  xit('should start and stop an instance', async () => {
    const ratchet: Ec2Ratchet = new Ec2Ratchet();

    const instId: string = 'i-replace_me';

    Logger.info('First start');
    await ratchet.launchInstance(instId, 1000 * 60);

    Logger.info('Next stop');
    await ratchet.stopInstance(instId, 1000 * 60);

    Logger.info('Complete');
  });
});

import fs from 'fs';
import path from 'path';
import os from 'os';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { Ec2Ratchet } from './ec2-ratchet.js';
import { SendSSHPublicKeyResponse } from '@aws-sdk/client-ec2-instance-connect';
import { Instance } from '@aws-sdk/client-ec2';
import { describe, expect, test } from 'vitest';

describe('#EC2Ratchet', function () {
  test.skip('should send a public key', async () => {
    const ratchet: Ec2Ratchet = new Ec2Ratchet();
    const instId: string = 'i-replace_me';
    const pubKey: string = fs.readFileSync(path.join(os.homedir(), '.ssh/id_rsa.pub')).toString();

    const res: SendSSHPublicKeyResponse = await ratchet.sendPublicKeyToEc2Instance(instId, pubKey);

    Logger.info('Got : %j', res);
    expect(res).toBeTruthy();
  });

  test.skip('should list instances', async () => {
    const ratchet: Ec2Ratchet = new Ec2Ratchet();

    const res: Instance[] = await ratchet.listAllInstances();

    Logger.info('Got : %j', res);
    expect(res).toBeTruthy();
    expect(res.length).toBeGreaterThan(1);
  });

  test.skip('should start and stop an instance', async () => {
    const ratchet: Ec2Ratchet = new Ec2Ratchet();

    const instId: string = 'i-replace_me';

    Logger.info('First start');
    await ratchet.launchInstance(instId, 1000 * 60);

    Logger.info('Next stop');
    await ratchet.stopInstance(instId, 1000 * 60);

    Logger.info('Complete');
  });
});

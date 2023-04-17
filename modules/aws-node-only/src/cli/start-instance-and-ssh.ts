import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';
import { Ec2Ratchet } from '@bitblit/ratchet-aws/lib/ec2/ec2-ratchet.js';
import { spawnSync, SpawnSyncReturns } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Instance } from '@aws-sdk/client-ec2';
import { SendSSHPublicKeyResponse } from '@aws-sdk/client-ec2-instance-connect';

export class StartInstanceAndSsh {
  private instanceId: string;
  private publicKeyFile: string;
  private instanceOsUser: string;
  private region: string;
  private availabilityZone: string;
  private ec2Ratchet: Ec2Ratchet;

  constructor(
    instanceId: string,
    publicKeyFile: string = path.join(os.homedir(), '.ssh', 'id_rsa.pub'),
    instanceOsUser: string = 'ec2-user',
    region: string = 'us-east-1',
    availabilityZone: string = 'us-east-1a'
  ) {
    this.instanceId = instanceId;
    this.publicKeyFile = publicKeyFile;
    this.instanceOsUser = instanceOsUser;
    this.region = region;
    this.availabilityZone = availabilityZone;

    this.ec2Ratchet = new Ec2Ratchet(this.region, this.availabilityZone);
  }

  public static createFromArgs(args: string[]): StartInstanceAndSsh {
    if (args?.length === 1 || args?.length === 2) {
      const instanceId = args[0];
      //const publicKeyFile = args[1];

      return new StartInstanceAndSsh(instanceId); // , publicKeyFile);
    } else {
      Logger.info('Usage : ratchet-start-instance-and-ssh {instanceId} {publicKeyFile} (Found %s arguments, need 1 or 2)', args);
      return null;
    }
  }

  public static async runFromCliArgs(args: string[]): Promise<void> {
    const inst: StartInstanceAndSsh = StartInstanceAndSsh.createFromArgs(args);
    return inst.run();
  }

  public async run(): Promise<any> {
    //return new Promise<any>(async (res, rej) => {
    let instance: Instance = await this.ec2Ratchet.describeInstance(this.instanceId);
    if (!!instance) {
      let launched: boolean = false;
      if (instance.State.Code == 16) {
        Logger.info('Instance is already running...');
        launched = true;
      } else {
        Logger.info('Instance is not running... starting up : %s', this.instanceId);
        launched = await this.ec2Ratchet.launchInstance(this.instanceId, 1000 * 30); // 30 seconds
      }

      if (launched) {
        Logger.info('Uploading public key...');
        const publicKeyText: string = fs.readFileSync(this.publicKeyFile).toString();
        const publicKeyResponse: SendSSHPublicKeyResponse = await this.ec2Ratchet.sendPublicKeyToEc2Instance(
          this.instanceId,
          publicKeyText,
          this.instanceOsUser
        );
        Logger.info('Key response : %j', publicKeyResponse);

        instance = instance && instance.PublicIpAddress ? instance : await this.ec2Ratchet.describeInstance(this.instanceId);
        Logger.info('Instance IP address is %s', instance.PublicIpAddress);
        const ret: SpawnSyncReturns<Buffer> = spawnSync('ssh', [this.instanceOsUser + '@' + instance.PublicIpAddress], {
          stdio: 'inherit',
        });

        Logger.info('%j', ret);
      } else {
        Logger.info('Instance could not start - check logs');
      }
    } else {
      Logger.info('No such instance found - check your AWS keys? : %s', this.instanceId);
    }
    //});
  }
}

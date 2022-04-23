import { Logger } from '../../common/logger';
import { CliRatchet } from '../common/cli-ratchet';
import { Ec2Ratchet } from '../../aws';
import { Instance } from 'aws-sdk/clients/ec2';
import { spawnSync, SpawnSyncReturns } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { SendSSHPublicKeyResponse } from 'aws-sdk/clients/ec2instanceconnect';

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

  public static createFromArgs(): StartInstanceAndSsh {
    if (
      process &&
      process.argv &&
      process.argv.length > 1 &&
      process.argv[process.argv.length - 2].indexOf('start-instance-and-ssh') > -1
    ) {
      const instanceId = process.argv[2];
      //const publicKeyFile = process.argv[3];

      return new StartInstanceAndSsh(instanceId); // , publicKeyFile);
    } else {
      console.log(
        'Usage : node start-instance-and-ssh {instanceId} {publicKeyFile} (Found ' + process.argv.length + ' arguments, need at least 2)'
      );
      return null;
    }
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

if (CliRatchet.isCalledFromCLI('start-instance-and-ssh')) {
  /**
   And, in case you are running this command line...
   **/
  Logger.info('Running start-instance-and-ssh from command line arguments');
  const startInstanceAndSsh: StartInstanceAndSsh = StartInstanceAndSsh.createFromArgs();
  if (startInstanceAndSsh) {
    startInstanceAndSsh
      .run()
      .then((out) => {
        Logger.info('Complete : %j', out);
      })
      .catch((err) => Logger.error('Caught error : %s', err, err));
  }
}

import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { Ec2Ratchet } from "@bitblit/ratchet-aws/ec2/ec2-ratchet";
import { spawnSync, SpawnSyncReturns } from "child_process";
import os from "os";
import path from "path";
import { Instance } from "@aws-sdk/client-ec2";
import { Ec2InstanceUtil } from "../ec2/ec2-instance-util.js";

export class StartInstanceAndSsh {
  private instanceId: string;
  private publicKeyFile: string;
  private instanceOsUser: string;
  private region: string;
  private availabilityZone: string;
  private ec2Ratchet: Ec2Ratchet;
  private instanceUtil: Ec2InstanceUtil;

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
    this.instanceUtil = new Ec2InstanceUtil(this.ec2Ratchet);
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
    const instance: Instance = await this.instanceUtil.startInstanceAndUploadPublicKeyFile(this.instanceId, this.publicKeyFile, this.instanceOsUser);
    if (instance) {
        Logger.info('Instance IP address is %s', instance.PublicIpAddress);
        const ret: SpawnSyncReturns<Buffer> = spawnSync('ssh', [this.instanceOsUser + '@' + instance.PublicIpAddress], {
          stdio: 'inherit',
        });
        Logger.info('%j', ret);
    } else {
      Logger.info('No such instance found - check your AWS keys? : %s', this.instanceId);
    }
    //});
  }
}

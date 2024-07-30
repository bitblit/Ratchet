import { Logger, RequireRatchet } from "@bitblit/ratchet-common";
import { Ec2Ratchet } from "@bitblit/ratchet-aws";
import fs from "fs";
import { Instance } from "@aws-sdk/client-ec2";
import { SendSSHPublicKeyResponse } from "@aws-sdk/client-ec2-instance-connect";
import { injectable } from "tsyringe";

@injectable()
export class Ec2InstanceUtil {

  constructor(private ec2Ratchet: Ec2Ratchet) {
  }

  public async startInstanceAndUploadPublicKeyFile(instanceId: string, filePath: string, instanceOsUser: string = 'ec2-user'): Promise<Instance> {
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(instanceId, 'instanceId');
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(filePath, 'filePath');
    RequireRatchet.true(fs.existsSync(filePath), 'File does not exist');
    Logger.info('Starting instance %s and uploading contents of public key file %s', instanceId, filePath);
    const publicKeyText: string = fs.readFileSync(filePath).toString();
    return this.startInstanceAndUploadPublicKey(instanceId, publicKeyText, instanceOsUser);
  }

  public async startInstanceAndUploadPublicKey(instanceId: string, publicKeyText: string, instanceOsUser: string = 'ec2-user'): Promise<Instance> {
    Logger.info('Starting instance %s, public key length %d, user %s', instanceId, publicKeyText.length, instanceOsUser);
    let instance: Instance = await this.ec2Ratchet.describeInstance(instanceId);
    if (!!instance) {
      let launched: boolean = false;
      if (instance.State.Code == 16) {
        Logger.info('Instance is already running...');
        launched = true;
      } else {
        Logger.info('Instance is not running... starting up : %s', instanceId);
        launched = await this.ec2Ratchet.launchInstance(instanceId, 1000 * 30); // 30 seconds
      }

      if (launched) {
        Logger.info('Uploading public key...');
        const publicKeyResponse: SendSSHPublicKeyResponse = await this.ec2Ratchet.sendPublicKeyToEc2Instance(
          instanceId,
          publicKeyText,
          instanceOsUser
        );
        Logger.info('Key response : %j', publicKeyResponse);

        instance = instance && instance.PublicIpAddress ? instance : await this.ec2Ratchet.describeInstance(instanceId);
        Logger.info('Instance IP address is %s', instance.PublicIpAddress);
      } else {
        Logger.info('Instance could not start - check logs');
      }
    } else {
      Logger.info('No such instance found - check your AWS keys? : %s', instanceId);
    }
    return instance;
  }
}

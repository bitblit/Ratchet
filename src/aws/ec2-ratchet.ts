import AWS from 'aws-sdk';
import {
  DescribeInstancesRequest,
  DescribeInstancesResult,
  Instance,
  StartInstancesRequest,
  StopInstancesRequest,
} from 'aws-sdk/clients/ec2';
import { SendSSHPublicKeyRequest, SendSSHPublicKeyResponse } from 'aws-sdk/clients/ec2instanceconnect';
import { Logger } from '../common/logger.js';
import { DurationRatchet } from '../common/duration-ratchet.js';
import { PromiseRatchet } from '../common/promise-ratchet.js';

/**
 * Service to simplify interacting with EC2 instances
 *
 * NOTE!  If you are going to describe instances, you MUST use resource: '*' in your
 * IAM priv - any other value will fail.  See
 * https://forums.aws.amazon.com/thread.jspa?threadID=142312 and
 * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-policies-for-amazon-ec2.html
 *
 *
 * Really should combine start and stop below
 */
export class Ec2Ratchet {
  private ec2: AWS.EC2;
  private ec2InstanceConnect: AWS.EC2InstanceConnect;

  constructor(private region: string = 'us-east-1', private availabilityZone: string = 'us-east-1a') {
    this.ec2 = new AWS.EC2({ region: region });
    this.ec2InstanceConnect = new AWS.EC2InstanceConnect({ region: region });
  }

  public async stopInstance(instanceId: string, maxWaitForShutdownMS: number = 0): Promise<boolean> {
    let rval: boolean = true;

    try {
      const stopParams: StopInstancesRequest = {
        InstanceIds: [instanceId],
        DryRun: false,
      };

      Logger.info('About to stop instances : %j', stopParams);
      await this.ec2.stopInstances(stopParams).promise();
      Logger.info('Stop instance command sent, waiting on shutdown');
      let status: Instance = await this.describeInstance(instanceId);

      if (maxWaitForShutdownMS > 0) {
        const start: number = new Date().getTime();
        while (!!status && status.State.Code !== 16 && new Date().getTime() - start < maxWaitForShutdownMS) {
          Logger.debug(
            'Instance status is %j - waiting for 5 seconds (up to %s)',
            status.State,
            DurationRatchet.formatMsDuration(maxWaitForShutdownMS)
          );
          await PromiseRatchet.wait(5000);
          status = await this.describeInstance(instanceId);
        }
      }
    } catch (err) {
      Logger.error('Failed to stop instance %s : %s', instanceId, err, err);
      rval = false;
    }
    return rval;
  }

  public async launchInstance(instanceId: string, maxWaitForStartupMS: number = 0): Promise<boolean> {
    let rval: boolean = true;

    try {
      const startParams: StartInstancesRequest = {
        InstanceIds: [instanceId],
        DryRun: false,
      };

      // const result: StartInstancesResult =
      Logger.info('About to start instance : %j', startParams);
      await this.ec2.startInstances(startParams).promise();
      Logger.info('Start instance command sent, waiting on startup');
      let status: Instance = await this.describeInstance(instanceId);

      if (maxWaitForStartupMS > 0) {
        const start: number = new Date().getTime();
        while (!!status && status.State.Code !== 16 && new Date().getTime() - start < maxWaitForStartupMS) {
          Logger.debug(
            'Instance status is %j - waiting for 5 seconds (up to %s)',
            status.State,
            DurationRatchet.formatMsDuration(maxWaitForStartupMS)
          );
          await PromiseRatchet.wait(5000);
          status = await this.describeInstance(instanceId);
        }
      }

      if (!!status && !!status.PublicIpAddress) {
        Logger.info('Instance address is %s', status.PublicIpAddress);
        Logger.info('SSH command : ssh -i path_to_pem_file ec2-user@%s', status.PublicIpAddress);
      }
    } catch (err) {
      Logger.error('Failed to start instance %s : %s', instanceId, err, err);
      rval = false;
    }
    return rval;
  }

  public async describeInstance(instanceId: string): Promise<Instance> {
    const res: Instance[] = await this.listAllInstances([instanceId]);
    return res.length === 1 ? res[0] : null;
  }

  public async listAllInstances(instanceIds: string[] = []): Promise<Instance[]> {
    let rval: Instance[] = [];

    const req: DescribeInstancesRequest = {
      NextToken: null,
    };

    if (instanceIds && instanceIds.length > 0) {
      req.InstanceIds = instanceIds;
    }

    do {
      Logger.debug('Pulling instances... (%j)', req);
      const res: DescribeInstancesResult = await this.ec2.describeInstances(req).promise();
      res.Reservations.forEach((r) => {
        rval = rval.concat(r.Instances);
      });
      req.NextToken = res.NextToken;
    } while (req.NextToken);

    Logger.debug('Finished pulling instances (found %d)', rval.length);
    return rval;
  }

  public async sendPublicKeyToEc2Instance(
    instanceId: string,
    publicKeyString: string,
    instanceOsUser?: string
  ): Promise<SendSSHPublicKeyResponse> {
    const userName: string = instanceOsUser || 'ec2-user';
    const req: SendSSHPublicKeyRequest = {
      InstanceId: instanceId,
      AvailabilityZone: this.availabilityZone,
      InstanceOSUser: userName,
      SSHPublicKey: publicKeyString,
    };

    const rval: SendSSHPublicKeyResponse = await this.ec2InstanceConnect.sendSSHPublicKey(req).promise();
    return rval;
  }
}

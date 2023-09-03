import { Logger } from '../../common/logger';
import {
  ChangeResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommandInput,
  ChangeResourceRecordSetsCommandOutput,
  GetChangeCommandInput,
  Route53Client,
  waitUntilResourceRecordSetsChanged,
} from '@aws-sdk/client-route-53';
import { WaiterResult, WaiterState } from '@smithy/util-waiter';

export class Route53Ratchet {
  constructor(
    private route53: Route53Client,
    private hostedZoneId: string,
  ) {
    if (!this.route53) {
      throw 'route53 may not be null';
    }
  }

  public get route53Client(): Route53Client {
    return this.route53;
  }

  public async changeCnameRecordTarget(
    domainName: string,
    target: string,
    hostedZoneId: string = this.hostedZoneId,
    ttlSeconds = 600,
  ): Promise<boolean> {
    Logger.info('Updating %s to point to %s', domainName, target);

    try {
      const params: ChangeResourceRecordSetsCommandInput = {
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: domainName,
                ResourceRecords: [
                  {
                    Value: target,
                  },
                ],
                TTL: ttlSeconds,
                Type: 'CNAME',
              },
            },
          ],
        },
        HostedZoneId: hostedZoneId,
      };

      const result: ChangeResourceRecordSetsCommandOutput = await this.route53.send(new ChangeResourceRecordSetsCommand(params));
      Logger.debug('Updated domain result: %j', result);

      const waitParams: GetChangeCommandInput = {
        Id: result.ChangeInfo.Id,
      };

      const waitResult: WaiterResult = await waitUntilResourceRecordSetsChanged({ client: this.route53, maxWaitTime: 300 }, waitParams);
      Logger.debug('Wait responsed: %j', waitResult);

      if (waitResult.state === WaiterState.SUCCESS) {
        Logger.info('Updated %s to point to %s', domainName, hostedZoneId);
        return true;
      }
    } catch (err) {
      Logger.warn('Error update CName for %s with value %s: %j', domainName, target, err);
    }

    Logger.info('Cannot update %s to point to %s', domainName, target);
    return false;
  }
}

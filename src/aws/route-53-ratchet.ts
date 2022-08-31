import { Logger } from '../common/logger.js';
import * as AWS from 'aws-sdk';
import {
  ChangeResourceRecordSetsRequest,
  ChangeResourceRecordSetsResponse,
  GetChangeRequest,
  GetChangeResponse,
} from 'aws-sdk/clients/route53';

export class Route53Ratchet {
  constructor(private route53: AWS.Route53, private hostedZoneId: string) {
    if (!this.route53) {
      throw 'route53 may not be null';
    }
  }

  public async changeCnameRecordTarget(
    domainName: string,
    target: string,
    hostedZoneId: string = this.hostedZoneId,
    ttlSeconds = 600
  ): Promise<boolean> {
    Logger.info('Updating %s to point to %s', domainName, target);

    try {
      const params: ChangeResourceRecordSetsRequest = {
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

      const result: ChangeResourceRecordSetsResponse = await this.route53.changeResourceRecordSets(params).promise();
      Logger.debug('Updated domain result: %j', result);

      const waitParams: GetChangeRequest = {
        Id: result.ChangeInfo.Id,
      };

      const waitResult: GetChangeResponse = await this.route53.waitFor('resourceRecordSetsChanged', waitParams).promise();
      Logger.debug('Wait responsed: %j', waitResult);

      if (waitResult.ChangeInfo.Status === 'INSYNC') {
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

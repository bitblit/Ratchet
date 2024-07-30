import { Logger, MailerUtil, MailSendingProvider, RequireRatchet, ResolvedReadyToSendEmail, StringRatchet } from '@bitblit/ratchet-common';
import { SendRawEmailCommand, SendRawEmailCommandOutput, SendRawEmailRequest, SESClient } from '@aws-sdk/client-ses';
import { DateTime } from 'luxon';
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import { S3CacheRatchetLike } from '../s3/s3-cache-ratchet-like';
import { injectable } from "tsyringe";

/**
 * Generic Mail Sender for AWS.
 *
 * Params:
 * ses: AWS SES handler, properly configured
 * defaultSendingAddress:
 */
@injectable()
export class SesMailSendingProvider implements MailSendingProvider<SendRawEmailCommandOutput, CompleteMultipartUploadCommandOutput> {
  constructor(
    private _ses: SESClient,
    private _archiveRatchet?: S3CacheRatchetLike,
    private archivePrefix?: string,
  ) {
    RequireRatchet.notNullOrUndefined(this._ses);
    if (!!_archiveRatchet && !_archiveRatchet.getDefaultBucket()) {
      throw new Error('If archiveRatchet specified, must set a default bucket');
    }
  }

  public async archiveEmail(
    mail: ResolvedReadyToSendEmail,
    rawSendResult: SendRawEmailCommandOutput,
  ): Promise<CompleteMultipartUploadCommandOutput> {
    let rval: CompleteMultipartUploadCommandOutput = null;
    if (!!this._archiveRatchet) {
      Logger.debug('Archiving outbound email to : %j', mail.destinationAddresses);
      let targetPath: string = StringRatchet.trimToEmpty(this.archivePrefix);
      if (!targetPath.endsWith('/')) {
        targetPath += '/';
      }
      const now: DateTime = DateTime.utc();
      targetPath +=
        'year=' +
        now.toFormat('yyyy') +
        '/month=' +
        now.toFormat('MM') +
        '/day=' +
        now.toFormat('dd') +
        '/hour=' +
        now.toFormat('HH') +
        '/' +
        now.toFormat('mm_ss__SSS');
      targetPath += '.json';
      try {
        rval = await this._archiveRatchet.writeObjectToCacheFile(targetPath, mail);
      } catch (err) {
        Logger.warn('Failed to archive email %s %j : %s', targetPath, mail, err);
      }
    }
    return rval;
  }

  public get sesClient(): SESClient {
    return this._ses;
  }

  public get archiveRatchet(): S3CacheRatchetLike {
    return this._archiveRatchet;
  }

  public async sendEmail(inRts: ResolvedReadyToSendEmail): Promise<SendRawEmailCommandOutput> {
    RequireRatchet.notNullOrUndefined(inRts, 'RTS must be defined');
    RequireRatchet.notNullOrUndefined(inRts.destinationAddresses, 'Destination addresses must be defined');
    let rval: SendRawEmailCommandOutput = null;
    const rawMail: string = MailerUtil.convertResolvedReadyToSendEmailToRaw(inRts);

    const params: SendRawEmailRequest = {
      RawMessage: { Data: new TextEncoder().encode(rawMail) },
    };

    rval = await this._ses.send(new SendRawEmailCommand(params));
    return rval;
  }
}

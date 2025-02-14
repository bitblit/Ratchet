import { ParsedMail, simpleParser } from 'mailparser';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { RequireRatchet } from '@bitblit/ratchet-common/lang/require-ratchet';
import { ParsedEmailProcessor } from './parsed-email-processor.js';
import { S3CacheRatchet } from '@bitblit/ratchet-aws/s3/s3-cache-ratchet';

/**
 * Service for handling inbound emails
 */
export class InboundEmailRatchet {
  constructor(
    private cache: S3CacheRatchet,
    private processors: ParsedEmailProcessor<any>[],
  ) {
    RequireRatchet.notNullOrUndefined(this.cache, 'cache');
    RequireRatchet.notNullOrUndefined(this.cache.getDefaultBucket(), 'cache.defaultBucket');
  }

  public async processEmailFromS3(key: string): Promise<boolean> {
    const rval: boolean = false;
    if (await this.cache.fileExists(key)) {
      const data: string = await this.cache.fetchCacheFileAsString(key);
      return this.processEmailFromBuffer(new Buffer(data));
    } else {
      Logger.warn('Cannot process inbound email - no such key : %s', key);
    }

    return rval;
  }

  public async processEmailFromBuffer(buf: Buffer): Promise<boolean> {
    let rval: boolean = false;
    RequireRatchet.notNullOrUndefined(buf, 'buf');
    Logger.info('Processing inbound email - size %d bytes', buf.length);

    const message: ParsedMail = await simpleParser(buf);
    Logger.info(
      'Found mail from "%s" subject "%s" with %d attachments',
      message?.from?.text,
      message?.subject,
      message?.attachments?.length,
    );

    for (let i = 0; i < this.processors.length && !rval; i++) {
      if (this.processors[i].canProcess(message)) {
        Logger.info('Processing message with processor %d', i);
        const result: any = await this.processors[i].processEmail(message);
        Logger.info('Result was : %j', result);
        rval = true;
      }
    }

    return rval;
  }
}

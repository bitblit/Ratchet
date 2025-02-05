import { ParsedEmailProcessor } from './parsed-email-processor.js';
import { ParsedMail } from 'mailparser';

export class SampleEmailProcessor implements ParsedEmailProcessor<string> {
  public canProcess(_mail: ParsedMail): boolean {
    return true;
  }

  public async processEmail(msg: ParsedMail): Promise<string> {
    return msg.body;
  }
}

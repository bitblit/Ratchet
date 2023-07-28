import { ParsedEmailProcessor } from './parsed-email-processor';
import { ParsedMail } from 'mailparser';

export class SampleEmailProcessor implements ParsedEmailProcessor<string> {
  public canProcess(mail: ParsedMail): boolean {
    return true;
  }

  public async processEmail(msg: ParsedMail): Promise<string> {
    return msg.body;
  }
}

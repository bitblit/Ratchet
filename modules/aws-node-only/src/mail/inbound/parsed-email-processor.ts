import { ParsedMail } from 'mailparser';
export interface ParsedEmailProcessor<T> {
  canProcess(mail: ParsedMail): boolean;
  processEmail(msg: ParsedMail): Promise<T>;
}

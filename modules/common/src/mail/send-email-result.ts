import { ReadyToSendEmail } from './ready-to-send-email.js';
import { ResolvedReadyToSendEmail } from './resolved-ready-to-send-email.js';
import { ArchiveEmailResult } from './archive-email-result';

/**
 * Results of sending an email
 */
export interface SendEmailResult<T, R> {
  request: ReadyToSendEmail;
  resolved: ResolvedReadyToSendEmail;
  success: boolean;
  rawResult: T;
  error: string;
  meta: Record<string, any>;
  archiveResults: ArchiveEmailResult<R>;
}

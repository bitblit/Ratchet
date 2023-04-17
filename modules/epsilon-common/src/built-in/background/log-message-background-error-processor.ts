import { Logger } from '@bitblit/ratchet-common/lib/logger/logger.js';
import { BackgroundErrorProcessor } from '../../config/background/background-error-processor.js';
import { InternalBackgroundEntry } from '../../background/internal-background-entry.js';

// This is just here to test error processor logic (errors are logged anyway)
export class LogMessageBackgroundErrorProcessor implements BackgroundErrorProcessor {
  public async handleError(submission: InternalBackgroundEntry<any>, error: Error): Promise<void> {
    Logger.error('-------- ERROR PROCESSED : %j : %s----', submission, error);
  }
}

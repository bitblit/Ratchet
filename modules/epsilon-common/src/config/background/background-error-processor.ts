import { InternalBackgroundEntry } from '../../background/internal-background-entry.js';

export interface BackgroundErrorProcessor {
  handleError(submission: InternalBackgroundEntry<any>, error: Error): Promise<void>;
}

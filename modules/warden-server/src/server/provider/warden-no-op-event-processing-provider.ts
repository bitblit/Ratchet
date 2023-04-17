/**
 * Default implementation of the event processing provider - does nothing
 */
import { WardenEntry } from '@bitblit/ratchet-warden-common/lib/common/model/warden-entry.js';
import { WardenEventProcessingProvider } from './warden-event-processing-provider.js';

export class WardenNoOpEventProcessingProvider implements WardenEventProcessingProvider {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async userCreated(entry: WardenEntry): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async userRemoved(entry: WardenEntry): Promise<void> {}
}

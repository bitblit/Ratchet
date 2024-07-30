/**
 * Default implementation of the event processing provider - does nothing
 */
import { WardenEntry } from '@bitblit/ratchet-warden-common';
import { WardenEventProcessingProvider } from './warden-event-processing-provider.js';
import { injectable } from "tsyringe";

@injectable()
export class WardenNoOpEventProcessingProvider implements WardenEventProcessingProvider {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async userCreated(entry: WardenEntry): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async userRemoved(entry: WardenEntry): Promise<void> {}
}

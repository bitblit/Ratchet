import { WardenEntry } from '@bitblit/ratchet-warden-common/dist/common/model/warden-entry.js';

/**
 * Notifies the containing system when significant events happen
 */

export interface WardenEventProcessingProvider {
  userCreated(entry: WardenEntry): Promise<void>;
  userRemoved(entry: WardenEntry): Promise<void>;
}

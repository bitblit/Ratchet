import { WardenEntry } from '../../common/model/warden-entry';

/**
 * Notifies the containing system when significant events happen
 */

export interface WardenEventProcessingProvider {
  userCreated(entry: WardenEntry): Promise<void>;
  userRemoved(entry: WardenEntry): Promise<void>;
}

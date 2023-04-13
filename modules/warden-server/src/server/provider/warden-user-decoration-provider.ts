/**
 * The user details gets jammed into the JWT token upon login.  If one is not provided,
 * the default only puts the user id and label in there
 */
import { WardenEntry } from '@bitblit/ratchet-warden-common/dist/common/model/warden-entry.js';
import { WardenUserDecoration } from '@bitblit/ratchet-warden-common/dist/common/model/warden-user-decoration.js';

export interface WardenUserDecorationProvider<T> {
  fetchDecoration(wardenUser: WardenEntry): Promise<WardenUserDecoration<T>>;
}

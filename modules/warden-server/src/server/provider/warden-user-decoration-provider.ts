/**
 * The user details gets jammed into the JWT token upon login.  If one is not provided,
 * the default only puts the user id and label in there
 */
import { WardenEntry, WardenUserDecoration } from '@bitblit/ratchet-warden-common';

export interface WardenUserDecorationProvider<T> {
  fetchDecoration(wardenUser: WardenEntry): Promise<WardenUserDecoration<T>>;
}

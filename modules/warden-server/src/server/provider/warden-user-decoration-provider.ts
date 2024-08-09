/**
 * The user details gets jammed into the JWT token upon login.  If one is not provided,
 * the default only puts the user id and label in there
 */
import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { WardenUserDecoration } from "@bitblit/ratchet-warden-common/common/model/warden-user-decoration";

export interface WardenUserDecorationProvider<T> {
  fetchDecoration(wardenUser: WardenEntry): Promise<WardenUserDecoration<T>>;
}

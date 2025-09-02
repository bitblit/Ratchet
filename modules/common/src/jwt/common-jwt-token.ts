/**
 * This is meant to be an object that wraps up the standard JWT fields along with some other helpful fields
 * in a type-safe way.  This is used in my Epsilon library, although it can be easily used elsewhere.
 *
 * In the case of a sudo situation, use the proxy field.  For example, if I am alice, but I am running as
 * bob, bob should be in the user field and alice should be in the proxy field.  While this may seem somewhat
 * backwards, it allows the majority of code to proceed as if bob is logged in, and only code that cares that a
 * proxy is going on (e.g., audit trail code) needs to even check the proxy field.
 *
 * Note: other interfaces can extend this token to gain more functionality
 */
import { JwtTokenBase } from './jwt-token-base.js';

export interface CommonJwtToken<T> extends JwtTokenBase {
  user: T; // Data for the authenticated user
  proxy: T; // Data for the proxy user (if any)
}

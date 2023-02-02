import { SimpleAuthenticationContactEntry } from '../model/simple-authentication-contact-entry';
import { SimpleAuthenticationContactType } from '../model/simple-authentication-contact-type';

/**
 * Classes implementing SimpleAuthenticationExpiringTokenSendingProvider are able to
 * send expiring, single
 */

export interface SimpleAuthenticationExpiringTokenSendingProvider {
  handlesContactType(type: SimpleAuthenticationContactType): boolean;
  sendExpiringToken(contact: SimpleAuthenticationContactEntry, token: string): Promise<boolean>;
  checkToken(contact: SimpleAuthenticationContactEntry, token: string): Promise<boolean>;
}

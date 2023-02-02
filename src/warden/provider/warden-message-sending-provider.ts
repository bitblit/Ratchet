import { WardenContactEntry } from '../model/warden-contact-entry';
import { WardenContactType } from '../model/warden-contact-type';

/**
 * Classes implementing WardenMessageSendingProvider are able to
 * send expiring, single
 */

export interface WardenMessageSendingProvider<T> {
  handlesContactType(type: WardenContactType): boolean;
  sendMessage(contact: WardenContactEntry, message: T): Promise<boolean>;
  formatMessage(contact: WardenContactEntry, messageType: WardenCustomerMessageType, context: Record<string, any>): Promise<T>;
}

import { WardenContactType } from '@bitblit/ratchet-warden-common';
import { WardenContact } from '@bitblit/ratchet-warden-common';
import { WardenCustomerMessageType } from '@bitblit/ratchet-warden-common';

/**
 * Classes implementing WardenMessageSendingProvider are able to
 * send expiring, single
 */

export interface WardenMessageSendingProvider<T> {
  handlesContactType(type: WardenContactType): boolean;
  sendMessage(contact: WardenContact, message: T): Promise<boolean>;
  formatMessage(contact: WardenContact, messageType: WardenCustomerMessageType, context: Record<string, any>): Promise<T>;
}

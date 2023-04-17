import { WardenContactType } from '@bitblit/ratchet-warden-common/lib/common/model/warden-contact-type.js';
import { WardenContact } from '@bitblit/ratchet-warden-common/lib/common/model/warden-contact.js';
import { WardenCustomerMessageType } from '@bitblit/ratchet-warden-common/lib/common/model/warden-customer-message-type.js';

/**
 * Classes implementing WardenMessageSendingProvider are able to
 * send expiring, single
 */

export interface WardenMessageSendingProvider<T> {
  handlesContactType(type: WardenContactType): boolean;
  sendMessage(contact: WardenContact, message: T): Promise<boolean>;
  formatMessage(contact: WardenContact, messageType: WardenCustomerMessageType, context: Record<string, any>): Promise<T>;
}

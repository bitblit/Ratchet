import { WardenContact } from '../../common/model/warden-contact';
import { WardenContactType } from '../../common/model/warden-contact-type';
import { WardenCustomerMessageType } from '../../common/model/warden-customer-message-type';

/**
 * Classes implementing WardenMessageSendingProvider are able to
 * send expiring, single
 */

export interface WardenMessageSendingProvider<T> {
  handlesContactType(type: WardenContactType): boolean;
  sendMessage(contact: WardenContact, message: T): Promise<boolean>;
  formatMessage(contact: WardenContact, messageType: WardenCustomerMessageType, context: Record<string, any>): Promise<T>;
}

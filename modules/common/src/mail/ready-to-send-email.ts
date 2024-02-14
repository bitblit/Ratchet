/**
 * @interface ReadyToSendEmail
 */
import { EmailAttachment } from './email-attachment.js';

export interface ReadyToSendEmail {
  /**
   *
   * @type {Array<string>}
   * @memberof ReadyToSendEmail
   */
  destinationAddresses?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof ReadyToSendEmail
   */
  bccAddresses?: Array<string>;
  /**
   *
   * @type {Array<EmailAttachment>}
   * @memberof ReadyToSendEmail
   */
  attachments?: Array<EmailAttachment>;
  /**
   *
   * @type {string}
   * @memberof ReadyToSendEmail
   */
  fromAddress?: string;
  /**
   *
   * @type {string}
   * @memberof ReadyToSendEmail
   */
  txtMessage?: string;
  /**
   *
   * @type {string}
   * @memberof ReadyToSendEmail
   */
  htmlMessage?: string;
  /**
   *
   * @type {string}
   * @memberof ReadyToSendEmail
   */
  subject?: string;
  /**
   *
   * @type {string}
   * @memberof ReadyToSendEmail
   */
  fromName?: string;
  /**
   *
   * @type {boolean}
   * @memberof ReadyToSendEmail
   */
  doNotAutoBcc?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof ReadyToSendEmail
   */
  doNotArchive?: boolean;
}

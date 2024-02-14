/**
 * @interface ResolvedReadyToSendEmail
 */
import { ReadyToSendEmail } from './ready-to-send-email.js';

export interface ResolvedReadyToSendEmail extends ReadyToSendEmail {
  /**
   * The list of destination addresses before any sending/filtering rules were applied
   * @type {Array<string>}
   * @memberof ReadyToSendEmail
   */
  srcDestinationAddresses?: string[];
  /**
   * The original list of bcc addresses before any auto-bcc were added
   */
  srcBccAddresses?: string[];
}

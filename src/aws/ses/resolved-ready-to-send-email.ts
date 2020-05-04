/**
 * @interface ResolvedReadyToSendEmail
 */
import {ReadyToSendEmail} from './ready-to-send-email';

export interface ResolvedReadyToSendEmail extends ReadyToSendEmail {
    /**
     * The list of destination addresses before any sending/filtering rules were applied
     * @type {Array<string>}
     * @memberof ReadyToSendEmail
     */
    srcDestinationAddresses?: Array<string>;
}

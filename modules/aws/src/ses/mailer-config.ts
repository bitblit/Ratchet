import { RatchetTemplateRenderer } from './ratchet-template-renderer.js';
import { S3CacheRatchet } from '../s3/s3-cache-ratchet.js';

/**
 * Configuration options for generic mailer
 */
export interface MailerConfig {
  // If no sending email is set, and this is, then it is used
  defaultSendingAddress?: string;
  // These addresses get added as BCC to any outbound email
  // If filters end up removing all destination addresses, this is copied into the destination so they still get sent
  // This behavior is for dev/demo style configurations where you still want to see the email even though the email
  // itself isn't sent
  autoBccAddresses?: string[];
  // If set, the mailer object can delegate template filling to this template renderer.
  templateRenderer?: RatchetTemplateRenderer;
  // If set, any outbound email address will be checked against this list and removed if it does not match
  // Typically used for testing dev/demo configs
  allowedDestinationEmails?: RegExp[];
  // If set, any outbound email is also archived to this bucket
  archive?: S3CacheRatchet;
  // If set, any outbound email is archived under this prefix using the above ratchet
  archivePrefix?: string;
  // If set, if the txt or html bodies are larger than this they will be auto-converted to attachments
  // For SES, this should be 10485760 or less as of 2021-01-27
  maxMessageBodySizeInBytes?: number;
  // If set, any attachments larger than this are auto-dropped
  maxAttachmentSizeInBase64Bytes?: number;
}

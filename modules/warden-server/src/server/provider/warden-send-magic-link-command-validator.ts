/**
 * This object checks if a magic link request may be processed.
 *
 * Should throw an error if not allowed
 *
 */
import { SendMagicLink } from '@bitblit/ratchet-warden-common';

export interface WardenSendMagicLinkCommandValidator {
  allowMagicLinkCommand(cmd: SendMagicLink, origin: string, loggedInUserId: string): Promise<void>;
}

/**
 * This object checks if a magic link request may be processed.
 *
 * Should throw an error if not allowed
 *
 */
import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { SendMagicLink } from "@bitblit/ratchet-warden-common/common/command/send-magic-link";

export interface WardenSendMagicLinkCommandValidator {
  allowMagicLinkCommand(cmd: SendMagicLink, origin: string, loggedInUser: WardenEntry): Promise<void>;
}

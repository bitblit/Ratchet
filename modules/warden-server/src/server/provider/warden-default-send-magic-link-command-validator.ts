/**
 * The user details gets jammed into the JWT token upon login.  If one is not provided,
 * the default only puts the WardenEntrySummary in there
 */
import { WardenEntry } from "@bitblit/ratchet-warden-common/common/model/warden-entry";
import { SendMagicLink } from "@bitblit/ratchet-warden-common/common/command/send-magic-link";
import { WardenSendMagicLinkCommandValidator } from "./warden-send-magic-link-command-validator.js";

export class WardenDefaultSendMagicLinkCommandValidator implements WardenSendMagicLinkCommandValidator {
  public async allowMagicLinkCommand(cmd: SendMagicLink, origin: string, loggedInUser: WardenEntry): Promise<void> {
    if (!cmd) {
      throw new Error('Cannot process null magic link');
    }
    if (cmd.ttlSeconds && cmd.ttlSeconds > 3600) {
      throw new Error('TTL may not exceed 3600 seconds');
    }
    if (cmd.overrideDestinationContact) {
      throw new Error('You may not specify an overrideDestinationContact');
    }
  }
}

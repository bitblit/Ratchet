import { CreateAccount } from "@bitblit/ratchet-warden-common/common/command/create-account";

/**
 * Classes implementing WardenAccountCreationGate are able to
 * determine if a new account should be allowed to be created
 */

export interface WardenAccountCreationGate {
  mayCreateAccount(create: CreateAccount): Promise<boolean>;
}

import { CreateAccount } from "@bitblit/ratchet-warden-common/common/command/create-account";
import { WardenAccountCreationGate } from './warden-account-creation-gate.ts';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

/**
 * For closed systems - automatically rejects any attempt to create an account
 */

export class WardenDenyAllAccountCreationGate implements WardenAccountCreationGate {
  public async mayCreateAccount(create: CreateAccount): Promise<boolean> {
    Logger.warn('User attempted to create an account in closed system: %j', create);
    return false;
  }
}

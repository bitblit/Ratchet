import { WardenContact, WardenContactType } from '@bitblit/ratchet-warden-common';

/**
 * Classes implementing WardenSingleUseCodeProvider are able to
 * generate single-use codes for a user, and to validate a code
 * provided by the user
 **/

export interface WardenSingleUseCodeProvider {
  handlesContactType(type: WardenContactType): boolean;
  createAndSendNewCode(contact: WardenContact, relyingPartyName: string): Promise<boolean>;
  checkCode(contactValue: string, code: string): Promise<boolean>;
  createCodeAndSendMagicLink?(
    contact: WardenContact,
    relyingPartyName: string,
    landingUrl: string,
    metaIn?: Record<string, string>,
    ttlSeconds?: number,
  ): Promise<boolean>;
}

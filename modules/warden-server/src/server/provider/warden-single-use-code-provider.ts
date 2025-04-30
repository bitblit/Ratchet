import { WardenContactType } from '@bitblit/ratchet-warden-common/common/model/warden-contact-type';
import { WardenContact } from '@bitblit/ratchet-warden-common/common/model/warden-contact';
import { WardenCustomTemplateDescriptor } from '@bitblit/ratchet-warden-common/common/command/warden-custom-template-descriptor';

/**
 * Classes implementing WardenSingleUseCodeProvider are able to
 * generate single-use codes for a user, and to validate a code
 * provided by the user
 **/

export interface WardenSingleUseCodeProvider {
  handlesContactType(type: WardenContactType): boolean;
  // Origin is the url of the page that sent the request - put into the template to allow clickthru
  createAndSendNewCode(contact: WardenContact, relyingPartyName: string, origin: string): Promise<boolean>;
  checkCode(contactValue: string, code: string): Promise<boolean>;
  // The code is to login the loginContact.  That is also where the code is sent, unless
  // destination contact is set (usually for admin/demo purposes)
  createCodeAndSendMagicLink?(
    loginContact: WardenContact,
    relyingPartyName: string,
    landingUrl: string,
    metaIn?: Record<string, string>,
    ttlSeconds?: number,
    destinationContact?: WardenContact,
    customTemplate?: WardenCustomTemplateDescriptor,
  ): Promise<boolean>;
}

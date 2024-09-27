//    Service for interacting with positions for a given user

export interface WardenMailerAndExpiringCodeRatchetSingleUseCodeProviderOptions {
  emailBaseLayoutName?: string;
  expiringTokenHtmlTemplateName: string;
  expiringTokenTxtTemplateName?: string;
  magicLinkHtmlTemplateName: string;
  magicLinkTxtTemplateName?: string;
  magicLinkSubjectLine?: string;
}

//    Service for interacting with positions for a given user

export interface WardenMailerMessageSendingProviderOptions {
  emailBaseLayoutName?: string;
  expiringTokenHtmlTemplateName: string;
  expiringTokenTxtTemplateName: string;
  magicLinkHtmlTemplateName: string;
  magicLinkTxtTemplateName: string;
}

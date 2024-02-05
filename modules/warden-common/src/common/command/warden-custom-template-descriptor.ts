export interface WardenCustomTemplateDescriptor {
  textVersion: string;
  htmlVersion?: string;
  baseLayout?: string;
  meta?: Record<string, string>;
}

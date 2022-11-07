import { ExpiringCode } from './expiring-code';

export interface ExpiringCodeProvider {
  storeCode(code: ExpiringCode): Promise<boolean>;
  checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean>;
}

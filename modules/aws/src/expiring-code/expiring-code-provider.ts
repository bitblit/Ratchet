import { ExpiringCode } from './expiring-code.js';

export interface ExpiringCodeProvider {
  storeCode(code: ExpiringCode): Promise<boolean>;
  checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean>;
}

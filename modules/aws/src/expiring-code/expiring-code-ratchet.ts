import { RequireRatchet } from '@bitblit/ratchet-common';
import { StringRatchet } from '@bitblit/ratchet-common';
import { ExpiringCodeProvider } from './expiring-code-provider.js';
import { ExpiringCodeParams } from './expiring-code-params.js';
import { ExpiringCode } from './expiring-code.js';

/**
 * Supports creating and checking single use codes
 */
export class ExpiringCodeRatchet {
  constructor(private provider: ExpiringCodeProvider) {}

  public static generateCode(params: ExpiringCodeParams): ExpiringCode {
    RequireRatchet.notNullOrUndefined(params, 'params');
    RequireRatchet.notNullOrUndefined(params.context, 'params.context');
    RequireRatchet.notNullOrUndefined(params.length, 'params.length');
    RequireRatchet.notNullOrUndefined(params.alphabet, 'params.alphabet');

    let code: string = '';
    for (let i = 0; i < params.length; i++) {
      code += params.alphabet.charAt(Math.floor(params.alphabet.length * Math.random()));
    }

    const rval: ExpiringCode = {
      code: code,
      context: params.context,
      tags: params.tags,
      expiresEpochMS: Date.now() + params.timeToLiveSeconds * 1000,
    };
    return rval;
  }

  public async createNewCode(params: ExpiringCodeParams): Promise<ExpiringCode> {
    const value: ExpiringCode = ExpiringCodeRatchet.generateCode(params);
    const rval: boolean = await this.provider.storeCode(value);
    return rval ? value : null;
  }

  public async checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean> {
    const rval: boolean = await this.provider.checkCode(StringRatchet.trimToEmpty(code), StringRatchet.trimToEmpty(context), deleteOnMatch);
    return rval;
  }
}

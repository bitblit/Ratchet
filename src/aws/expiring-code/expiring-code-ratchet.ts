import { RequireRatchet } from '../../common';
import { ExpiringCodeProvider } from './expiring-code-provider';
import { ExpiringCodeParams } from './expiring-code-params';
import { ExpiringCode } from './expiring-code';

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
      expiresEpochMS: Date.now() + params.timeToLiveSeconds * 1000,
    };
    return rval;
  }

  public async createNewCode(params: ExpiringCodeParams): Promise<boolean> {
    const value: ExpiringCode = ExpiringCodeRatchet.generateCode(params);
    const rval: boolean = await this.provider.storeCode(value);
    return rval;
  }

  public async checkCode(code: string, context: string, deleteOnMatch?: boolean): Promise<boolean> {
    const rval: boolean = await this.provider.checkCode(code, context, deleteOnMatch);
    return rval;
  }
}

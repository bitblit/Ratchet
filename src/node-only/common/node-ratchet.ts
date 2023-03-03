/**
 * Some helpers to make it safe to have the node-only classes inside Ratchet
 */
import { RequireRatchet } from '../../common/require-ratchet';
import { ErrorRatchet } from '../../common/error-ratchet';

export class NodeRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static fetchProcessEnvVar(envVar: string, ifNotNode?: string): string {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    if (global?.process?.env) {
      const value: string = process.env[envVar];
      return value;
    } else {
      if (ifNotNode !== undefined) {
        return ifNotNode;
      } else {
        throw ErrorRatchet.fErr('Cannot fetch env var : not running inside node (or poly-filled)');
      }
    }
  }

  public static setProcessEnvVar(envVar: string, value: string): void {
    RequireRatchet.notNullOrUndefined(envVar, 'envVar');
    RequireRatchet.notNullOrUndefined(value, 'value');
    if (global?.process?.env) {
      process.env[envVar] = value;
    } else {
      throw ErrorRatchet.fErr('Cannot set env var : not running inside node (or poly-filled) : %s : %s', envVar, value);
    }
  }
}

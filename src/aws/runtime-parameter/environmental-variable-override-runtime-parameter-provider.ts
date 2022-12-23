import { RuntimeParameterProvider } from './runtime-parameter-provider';
import { StoredRuntimeParameter } from './stored-runtime-parameter';
import { RequireRatchet } from '../../common/require-ratchet';
import { StringRatchet } from '../../common';

/**
 * Provides parameters for a runtime parameter from an environmental variable, where the key follows
 * a given format
 *
 * "Simple" because it forces all ttls to be the same value (ignores what is passed in) so that the
 * envvar itself can be just a string instead of a complex value
 */
export class EnvironmentalVariableOverrideRuntimeParameterProvider implements RuntimeParameterProvider {
  constructor(
    private wrapped: RuntimeParameterProvider,
    private globalTTL: number = 1,
    private separator: string = '.',
    private prefix: string = 'RuntimeEnv-',
    private suffix = ''
  ) {
    // They can be empty but they cannot be null
    RequireRatchet.notNullOrUndefined(this.wrapped, 'wrapped');
    RequireRatchet.notNullOrUndefined(this.separator, 'separator');
    RequireRatchet.notNullOrUndefined(this.prefix, 'separator');
    RequireRatchet.notNullOrUndefined(this.suffix, 'separator');
    RequireRatchet.notNullOrUndefined(global?.process?.env, '"process" not found - this only runs in Node, not the browser');
  }

  public generateName(groupId: string, paramKey: string): string {
    return this.prefix + groupId + this.separator + paramKey + this.suffix;
  }

  public async readParameter(groupId: string, paramKey: string): Promise<StoredRuntimeParameter> {
    const asString = StringRatchet.trimToNull(process.env[this.generateName(groupId, paramKey)]);
    const rval: StoredRuntimeParameter = asString
      ? {
          groupId: groupId,
          paramKey: paramKey,
          paramValue: JSON.parse(asString),
          ttlSeconds: this.globalTTL,
        }
      : await this.wrapped.readParameter(groupId, paramKey);
    return rval;
  }

  public async readAllParametersForGroup(groupId: string): Promise<StoredRuntimeParameter[]> {
    return this.wrapped.readAllParametersForGroup(groupId);
  }

  public async writeParameter(toStore: StoredRuntimeParameter): Promise<boolean> {
    return this.wrapped.writeParameter(toStore);
  }
}

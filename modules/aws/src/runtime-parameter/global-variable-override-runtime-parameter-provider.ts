import { RuntimeParameterProvider } from "./runtime-parameter-provider.js";
import { StoredRuntimeParameter } from "./stored-runtime-parameter.js";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { ErrorRatchet } from "@bitblit/ratchet-common/lang/error-ratchet";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";

/**
 * Provides parameters for a runtime parameter from an global (ie, process.env or global.xx) variable, where the key follows
 * a given format
 *
 * "Simple" because it forces all ttls to be the same value (ignores what is passed in) so that the
 * envvar itself can be just a string instead of a complex value
 */
export class GlobalVariableOverrideRuntimeParameterProvider implements RuntimeParameterProvider {
  private options: GlobalVariableOverrideRuntimeParameterProviderOptions = {
    globalTTL: 1,
    separator: '.',
    prefix: 'RuntimeEnv-',
    suffix: '',
  };

  constructor(private wrapped: RuntimeParameterProvider, opts?: GlobalVariableOverrideRuntimeParameterProviderOptions) {
    // They can be empty but they cannot be null
    RequireRatchet.notNullOrUndefined(this.wrapped, 'wrapped');
    RequireRatchet.notNullOrUndefined(global?.process?.env, '"process" not found - this only runs in Node, not the browser');

    if (opts) {
      this.options = opts;
    }
    RequireRatchet.notNullOrUndefined(this.options.globalTTL, 'this.options.globalTTL');
    RequireRatchet.notNullOrUndefined(this.options.separator, 'this.options.separator');
    RequireRatchet.true(this.options.globalTTL > 0, 'this.options.globalTTL must be larger than 0');
  }

  public generateName(groupId: string, paramKey: string): string {
    return (
      StringRatchet.trimToEmpty(this.options.prefix) +
      groupId +
      StringRatchet.trimToEmpty(this.options.separator) +
      paramKey +
      StringRatchet.trimToEmpty(this.options.suffix)
    );
  }

  public async readParameter(groupId: string, paramKey: string): Promise<StoredRuntimeParameter> {
    const asString = StringRatchet.trimToNull(process.env[this.generateName(groupId, paramKey)]);
    if (asString && !StringRatchet.canParseAsJson(asString)) {
      ErrorRatchet.throwFormattedErr(
        'Cannot parse ENV override (%s / %s) as JSON - did you forget the quotes on a string?',
        groupId,
        paramKey
      );
    }
    const rval: StoredRuntimeParameter = asString
      ? {
          groupId: groupId,
          paramKey: paramKey,
          paramValue: asString,
          ttlSeconds: this.options.globalTTL,
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

export interface GlobalVariableOverrideRuntimeParameterProviderOptions {
  globalTTL: number;
  separator: string;
  prefix?: string;
  suffix?: string;
}

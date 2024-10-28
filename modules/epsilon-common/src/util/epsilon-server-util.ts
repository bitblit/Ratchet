import { EpsilonServerMode } from "../config/espilon-server-mode";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { RequireRatchet } from "@bitblit/ratchet-common/lang/require-ratchet";
import { MapRatchet } from "@bitblit/ratchet-common/lang/map-ratchet";

export class EpsilonServerUtil {
  public static serverMode(envParamName: string, def: EpsilonServerMode): EpsilonServerMode {
    let rval: EpsilonServerMode = def;
    RequireRatchet.notNullUndefinedOrOnlyWhitespaceString(envParamName);
    if (typeof process !== 'undefined') {
      const stVal: string = StringRatchet.trimToNull(process.env[envParamName]);
      rval = MapRatchet.caseInsensitiveAccess<EpsilonServerMode>(EpsilonServerMode, stVal) ?? def;
    }
    return rval;
  }
}

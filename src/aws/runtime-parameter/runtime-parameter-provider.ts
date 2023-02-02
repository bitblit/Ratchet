/**
 * Classes implementing SimpleAuthenticationStorageProvider offer the ability to fetch a runtime parameter
 * object from _somewhere_
 * They do NOT handle local caching - the RuntimeParameterRatchet does that
 */
import { StoredRuntimeParameter } from './stored-runtime-parameter';

export interface RuntimeParameterProvider {
  readParameter(groupId: string, paramKey: string): Promise<StoredRuntimeParameter>;
  readAllParametersForGroup(groupId: string): Promise<StoredRuntimeParameter[]>;
  writeParameter(param: StoredRuntimeParameter): Promise<boolean>;
}

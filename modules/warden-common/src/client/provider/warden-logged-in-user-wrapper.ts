import { WardenJwtToken } from '../../common/model/warden-jwt-token';

export interface WardenLoggedInUserWrapper<T> {
  userObject: WardenJwtToken<T>;
  jwtToken: string;
  expirationEpochSeconds: number;
}

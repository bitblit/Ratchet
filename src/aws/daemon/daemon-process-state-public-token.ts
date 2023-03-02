import { JwtTokenBase } from '../../common/jwt/jwt-token-base';

export interface DaemonProcessStatePublicToken extends JwtTokenBase {
  daemonKey: string;
}

import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base.js';

export interface DaemonProcessStatePublicToken extends JwtTokenBase {
  daemonKey: string;
}

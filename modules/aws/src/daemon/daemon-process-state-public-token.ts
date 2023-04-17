import { JwtTokenBase } from '@bitblit/ratchet-common/lib/jwt/jwt-token-base.js';

export interface DaemonProcessStatePublicToken extends JwtTokenBase {
  daemonKey: string;
}

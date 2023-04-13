import { JwtTokenBase } from '@bitblit/ratchet-common/dist/jwt/jwt-token-base.js';

export interface DaemonProcessStatePublicToken extends JwtTokenBase {
  daemonKey: string;
}

import { JwtTokenBase } from "@bitblit/ratchet-common/jwt/jwt-token-base";

export interface DaemonProcessStatePublicToken extends JwtTokenBase {
  daemonKey: string;
}

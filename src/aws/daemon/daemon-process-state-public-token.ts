import { JwtTokenBase } from "../../common/jwt-token-base";

export interface DaemonProcessStatePublicToken extends JwtTokenBase {
  daemonKey: string;
}

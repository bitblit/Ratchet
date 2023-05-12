import { JwtTokenBase } from '@bitblit/ratchet-common';

export interface DaemonProcessStatePublicToken extends JwtTokenBase {
  daemonKey: string;
}

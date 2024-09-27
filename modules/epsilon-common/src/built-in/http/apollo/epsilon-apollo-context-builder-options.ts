import { JwtRatchetLike } from "@bitblit/ratchet-node-only/jwt/jwt-ratchet-like";

export interface EpsilonApolloContextBuilderOptions {
  jwtRatchet?: JwtRatchetLike;
}

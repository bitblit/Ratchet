import { WardenEntrySummary } from "../../common/model/warden-entry-summary.ts";
import { CommonJwtToken } from "@bitblit/ratchet-common/jwt/common-jwt-token";

export interface WardenLoggedInUserWrapper {
  userObject: CommonJwtToken<WardenEntrySummary>;
  jwtToken: string;
  expirationEpochSeconds: number;
}

import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { APIGatewayEvent } from "aws-lambda";
import { EpsilonAuthorizationContext } from "../../config/http/epsilon-authorization-context.js";

export class BuiltInAuthorizers {
  public static async simpleNoAuthenticationLogAccess(
    authorizationContext: EpsilonAuthorizationContext<any>,
    evt: APIGatewayEvent,
  ): Promise<boolean> {
    // Just logs the request but does nothing else
    Logger.debug('Auth requested for %s : %j', evt.path, authorizationContext?.auth);
    return true;
  }

  public static async simpleLoggedInAuth(authorizationContext: EpsilonAuthorizationContext<any>, evt: APIGatewayEvent): Promise<boolean> {
    // Just verifies that there is a valid token in the request
    const rval: boolean = !!authorizationContext?.auth;
    Logger.silly('SimpleLoggedInAuth returning %s for %s', rval, evt.path);
    return rval;
  }

}

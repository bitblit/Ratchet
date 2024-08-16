import { BaseContext } from "@apollo/server";
import { EpsilonLambdaApolloContextFunctionArgument } from "./epsilon-lambda-apollo-context-function-argument.js";
import { EventUtil } from "../../../http/event-util.js";
import { DefaultEpsilonApolloContext } from "./default-epsilon-apollo-context.js";
import { Logger } from "@bitblit/ratchet-common/logger/logger";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";
import { JwtTokenBase } from "@bitblit/ratchet-common/jwt/jwt-token-base";
import { ExpiredJwtHandling } from "@bitblit/ratchet-common/jwt/expired-jwt-handling";
import { EpsilonApolloContextBuilderOptions } from "./epsilon-apollo-context-builder-options";

export class ApolloUtil {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  //const defaultContextFn: ContextFunction<[EpsilonLambdaApolloContextFunctionArgument], any> = async () => ({});

  public static async emptyContext<T extends BaseContext>(): Promise<T> {
    return {} as T;
  }

  public static async defaultEpsilonApolloContext(
    args: EpsilonLambdaApolloContextFunctionArgument,
    opts?: EpsilonApolloContextBuilderOptions
  ): Promise<DefaultEpsilonApolloContext<any>> {

    const authTokenSt: string = EventUtil.extractBearerTokenFromEvent(args.lambdaEvent);
    let token: JwtTokenBase = null;
    if (StringRatchet.trimToNull(authTokenSt) && opts?.jwtRatchet) {
      Logger.debug('Proc token : %s', StringRatchet.obscure(authTokenSt));
      token = await opts.jwtRatchet.decodeToken(authTokenSt, ExpiredJwtHandling.RETURN_NULL);
    }

    const rval: DefaultEpsilonApolloContext<any> = {
      user: token,
      bearerTokenString: authTokenSt,
      headers: args.lambdaEvent.headers,
      functionName: args.lambdaContext.functionName,
      lambdaEvent: args.lambdaEvent,
      lambdaContext: args.lambdaContext,
    };
    return rval;
  }

}

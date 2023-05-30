import { BaseContext, ContextFunction } from '@apollo/server';
import { EpsilonLambdaApolloContextFunctionArgument } from './epsilon-lambda-apollo-context-function-argument.js';
import { EventUtil } from '../../../http/event-util.js';
import { JwtTokenBase, Logger } from '@bitblit/ratchet-common';
import { DefaultEpsilonApolloContext } from './default-epsilon-apollo-context.js';

export class ApolloUtil {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  //const defaultContextFn: ContextFunction<[EpsilonLambdaApolloContextFunctionArgument], any> = async () => ({});

  public static async emptyContext<T extends BaseContext>(): Promise<T> {
    return {} as T;
  }

  public static async defaultEpsilonApolloContext(
    args: EpsilonLambdaApolloContextFunctionArgument
  ): Promise<DefaultEpsilonApolloContext<any>> {
    const authTokenSt: string = EventUtil.extractBearerTokenFromEvent(args.lambdaEvent);
    const token: JwtTokenBase = null;
    if (!!authTokenSt && authTokenSt.startsWith('Bearer')) {
      Logger.info('Got : %s', authTokenSt);
    }
    // TODO: parse token here...

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

import { APIGatewayEvent, Context } from 'aws-lambda';
import { JwtTokenBase } from '@bitblit/ratchet-common/jwt/jwt-token-base';

export interface DefaultEpsilonApolloContext<T extends JwtTokenBase> {
  user?: T;
  bearerTokenString?: string;
  headers: Record<string, string>;
  functionName: string;
  lambdaEvent: APIGatewayEvent;
  lambdaContext: Context;
}

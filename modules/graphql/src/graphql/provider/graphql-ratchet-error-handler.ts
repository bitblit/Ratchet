import { AuthorizationStyle } from "../authorization-style";

export interface GraphqlRatchetErrorHandler {
  handleError(error: any, queryName: string, variables: Record<string, any>, authStyle : AuthorizationStyle): void;
}

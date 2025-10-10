import { AuthorizationStyle } from "@bitblit/ratchet-graphql/graphql/authorization-style";
import { ErrorHandlingApproach } from "@bitblit/ratchet-common/lang/error-handling-approach";
import { GraphqlQueryExecutionDisplayStyle } from "./graphql-query-execution-display-style.ts";

export interface GraphqlQueryExecutionOptions {
  blockMessage?: string;
  authStyle: AuthorizationStyle;
  errorHandling: ErrorHandlingApproach;
  displayStyle: GraphqlQueryExecutionDisplayStyle;
}

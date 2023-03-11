export interface GraphqlRatchetErrorHandler {
  handleError(error: any, queryName: string, variables: Record<string, any>, anonymous: boolean): void;
}

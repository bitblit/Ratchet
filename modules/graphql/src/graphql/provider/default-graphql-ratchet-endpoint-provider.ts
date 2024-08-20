export class DefaultGraphqlRatchetEndpointProvider {
  constructor(private value: string) {
  }
  public fetchGraphqlEndpoint(): string {
    return this.value;
  }
}

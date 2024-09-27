export interface GraphqlRatchetQueryProvider {
  fetchQueryText(name: string): Promise<string>;
}

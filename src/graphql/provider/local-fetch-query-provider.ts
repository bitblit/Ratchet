import { GraphqlRatchetQueryProvider } from './graphql-ratchet-query-provider';
import { Logger } from '../../common/logger';
import { StringRatchet } from '../../common';

export class LocalFetchQueryProvider implements GraphqlRatchetQueryProvider {
  private cacheMap: Map<string, string> = new Map<string, string>();

  constructor(private pathTemplate: string = 'assets/gql/{{QUERY_NAME}}.gql') {}

  public async fetchQueryText(qry: string): Promise<string> {
    let rval: string = this.cacheMap.get(qry);
    if (!rval) {
      const pathInput: string = this.pathTemplate.split('{{QUERY_NAME}}').join(qry.toLowerCase());
      Logger.info('Cache miss, loading %s from %s', qry, pathInput);
      const qryResp: Response = await fetch(pathInput);
      rval = StringRatchet.trimToNull(await qryResp.text());
      if (rval) {
        this.cacheMap.set(qry, rval);
      }
    }
    return rval;
  }
}

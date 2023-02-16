import { GraphqlRatchetQueryProvider } from './graphql-ratchet-query-provider';
import { Logger } from '../../common/logger';
import { StringRatchet } from '../../common';

export class LocalFetchQueryProvider implements GraphqlRatchetQueryProvider {
  private cacheMap: Map<string, string> = new Map<string, string>();

  constructor(private pathTemplate: string = 'assets/gql/{{QUERY_NAME}}.gql', private forcePathToLowerCase: boolean = false) {}

  public async fetchQueryText(qry: string): Promise<string> {
    let rval: string = this.cacheMap.get(qry.toLowerCase());
    if (!rval) {
      const tgt: string = this.forcePathToLowerCase ? qry.toLowerCase() : qry;
      const pathInput: string = this.pathTemplate.split('{{QUERY_NAME}}').join(tgt);
      Logger.info('Cache miss, loading %s from %s', qry, pathInput);
      const qryResp: Response = await fetch(pathInput);
      rval = StringRatchet.trimToNull(await qryResp.text());
      if (rval) {
        this.cacheMap.set(qry.toLowerCase(), rval);
      }
    }
    return rval;
  }
}

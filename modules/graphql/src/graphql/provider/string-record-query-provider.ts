import { GraphqlRatchetQueryProvider } from './graphql-ratchet-query-provider.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { StringRatchet } from '@bitblit/ratchet-common/lang/string-ratchet';

export class StringRecordQueryProvider implements GraphqlRatchetQueryProvider {
  private files: Record<string, string> = {};
  constructor(
    inFiles: Record<string, string>,
    private autoPrefix: string = '',
    private autoSuffix: string = '',
    private caseSensitive?: boolean,
  ) {
    if (inFiles) {
      if (caseSensitive) {
        this.files = Object.assign({}, inFiles);
      } else {
        Object.keys(inFiles).forEach((k) => {
          this.files[k.toLowerCase()] = inFiles[k];
        });
      }
    }
  }

  public async fetchQueryText(qry: string): Promise<string> {
    let lookupKey: string = '';
    lookupKey += this.caseSensitive ? StringRatchet.trimToEmpty(this.autoPrefix) : StringRatchet.trimToEmpty(this.autoPrefix).toLowerCase();
    lookupKey += this.caseSensitive ? StringRatchet.trimToEmpty(qry) : StringRatchet.trimToEmpty(qry).toLowerCase();
    lookupKey += this.caseSensitive ? StringRatchet.trimToEmpty(this.autoSuffix) : StringRatchet.trimToEmpty(this.autoSuffix).toLowerCase();

    const rval: string = this.files[lookupKey];
    if (!rval) {
      Logger.warn('Could not find %s in %j', lookupKey, Object.keys(this.files));
    }
    return rval;
  }
}

import { ErrorRatchet, Logger, StringRatchet } from "@bitblit/ratchet-common";

export class QueryUtil {
  private fields: string[] = [];
  private replacements: Record<string, unknown> = {};

  public addReplacement(replacement: Record<string, unknown>, ...fields: string[]): void {
    this.replacements = Object.assign(this.replacements, replacement);
    this.addFields(...fields);
  }

  public appendReplacement(replacementKey: string, appendValue: string, ...fields: string[]): void {
    this.replacements[replacementKey] = this.replacements[replacementKey] + appendValue;
    this.addFields(...fields);
  }

  public addFields(...fields: string[]): void {
    this.fields = this.fields.concat(...fields);
  }

  public getFields(): string[] {
    return this.fields;
  }

  public getReplacements(): Record<string, unknown> {
    return this.replacements;
  }

  public static sqlInjectionUnsafeParamRenderer(value: unknown): string {
    const rFn = (val: unknown): string => (typeof val === 'string' ? '"' + val + '"' : StringRatchet.safeString(val));
    const repl: string = Array.isArray(value) ? value.map((s: unknown) => rFn(s)).join(',') : rFn(value);
    return repl;
  }

  public static renderQueryStringForPasteIntoTool(
    query: string,
    inFields: object | null,
    transform: (x: unknown) => string = QueryUtil.sqlInjectionUnsafeParamRenderer,
  ): string | null {
    const fields = inFields ?? {};
    // This is not safe from sql injection at all so it really should only be used for
    let rval = QueryUtil.reformatQueryForLogging(query);
    if (rval) {
      const keys = Object.keys(fields);
      // Sort longest first so that it replaces correctly
      keys.sort((b, a) => a.length - b.length);

      for (const key of keys) {
        const val: unknown = fields[key as keyof typeof fields];
        const find: string = ':' + key;
        const repl: string = transform(val);
        rval = rval.split(find).join(repl);
      }
      if (!rval.endsWith(';')) {
        rval += ';';
      }
    }
    return rval;
  }

  public static reformatQueryForLogging(qry: string, inMaxLineLength = 80): string | null {
    let maxLineLength: number = inMaxLineLength;
    if (!StringRatchet.trimToNull(qry)) {
      return null;
    }
    let loggableQuery = '';
    // First, remove any built in CR/LF returns
    let cleaned: string = StringRatchet.trimToEmpty(qry).split('\n').join(' ').split('\r').join(' ');
    while (cleaned.length > maxLineLength) {
      let idx: number = Math.min(cleaned.length, maxLineLength);
      // Scan back until we hit a space or a comma
      while (idx > 0 && ![' ', ','].includes(cleaned.charAt(idx))) {
        idx--;
      }
      if (idx > 0) {
        loggableQuery += cleaned.substring(0, idx) + '\n';
        cleaned = StringRatchet.trimToEmpty(cleaned.substring(idx));
      } else {
        Logger.silly('Input contains a string longer than the max line length - bumping');
        maxLineLength += 2;
      }
    }
    return loggableQuery + (cleaned.length > 0 ? cleaned : '');
  }

  // Used by dbs like sqlite3 that want the prefix in the supplied record
  public static addPrefixToFieldNames(fields: Record<string, any>, prefix: string = ':'): Record<string, any> {
    let rval: Record<string, any> = {};
    Object.keys(fields).forEach(k=>{
      rval[prefix+k]=fields[k];
    });
    return rval;
  }


  // If any supplied fields are null/undefined, replaces their variable in the source query
  // Needed by dbs like sqlite3 that dont handle null injection well
  public static replaceNullReplacementsInQuery(query: string, fields: Record<string, any>): string {
    let rval: string = query;
    Object.keys(fields).forEach(k=>{
      if (fields[k]===null || fields[k]===undefined) {
        rval.replaceAll(k, 'null');
      }
    });
    return rval;
  }

  // Return a record that only contains fields that are actually used in the query
  public static removeUnusedFields(query: string, fields: Record<string, any>, prefix?:string): Record<string,any> {
    const usedFields: string[] = QueryUtil.extractUsedNamedParams(query);
    let rval: Record<string,any> = {  };
    Object.keys(fields).forEach(k=>{
      if (usedFields.includes(k) || (prefix && usedFields.includes(prefix+k))) {
        rval[k]=fields[k];
      }
    });
    return rval;
  }

  public static extractUsedNamedParams(query: string): string[] {
    // TODO: Cmon, this really should be a regex...
    //const usedParams: string[] = [...query.matchAll(/:[a-z0-9]+/i)].map((s) => StringRatchet.safeString(s));
    let state: number = 0;
    let idx: number = 0;
    const frags: string[] = []; // debug only
    const usedParams: string[] = [];
    let curString: string = '';
    while (idx < query.length) {
      const nextChar: string = query.charAt(idx++);
      if (state === 0) {
        // Not in a var
        if (nextChar === ':') {
          frags.push(curString);
          curString = ':';
          state = 1;
        } else {
          curString += nextChar;
        }
      } else if (state === 1) {
        // In a var
        if (!StringRatchet.stringContainsOnlyAlphanumeric(nextChar)) {
          usedParams.push(curString);
          curString = nextChar;
          state = 0;
        } else {
          curString += nextChar;
        }
      } else {
        throw ErrorRatchet.fErr('Cant happen - invalid state');
      }
    }
    // Whatever was left
    if (state === 0) {
      frags.push(curString);
    } else {
      usedParams.push(curString);
    }

    return usedParams;
  }
}

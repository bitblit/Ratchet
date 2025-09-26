import SqlString from 'sqlstring';
import { QueryAndParams } from "./query-and-params.ts";
import { QueryUtil } from "../../query-builder/query-util.ts";

/*
  This class is just here as a polyfill for those sad database libraries that
  do not handle named parameters themselves (like sqlite and postgres) so I have
  to do it for them
 */


export class NamedParameterAdapter {

  public static applyNamedValuesToQuery(qap: QueryAndParams, suffix?: string, customEscape: (val:any)=>string = SqlString.escape): QueryAndParams {
    const rval: QueryAndParams = Object.assign(qap);

    // First, rename all the fields to add the prefix
    let tmp: Record<string, any> = QueryUtil.addPrefixToFieldNames(rval.params, ':');
    // Then, replace any null params
    rval.query = QueryUtil.replaceNullReplacementsInQuery(rval.query, tmp);
    // Then, remove any unused params from the fields
    rval.params = QueryUtil.removeUnusedFields(rval.query, rval.params, ':');
    tmp = QueryUtil.removeUnusedFields(rval.query, tmp); // And the prefixed version
    // CAW 2024-09-13 - This seems convoluted, can probably clean it a bit

    Object.keys(tmp).forEach((k) => {
      const val: any = tmp[k];
      if (Array.isArray(val)) {
        const escaped: string = customEscape(val);
        rval.query = rval.query.replaceAll(k, escaped);
        //eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rval.params[k.substring(1)]; // this prolly wont work
      } else if (typeof val === 'boolean') {
        const strVal: string = val ? 'true' : 'false';
        rval.query = rval.query.replaceAll(k, strVal);
        //eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete rval.params[k.substring(1)]; // this prolly wont work
      } else {
        rval.query = rval.query.replaceAll(k, customEscape(val));
        delete rval.params[k.substring(1)]; // this prolly wont work
      }
    });

    if (suffix) {
      rval.query += suffix;
    }

    return rval;
  }

}

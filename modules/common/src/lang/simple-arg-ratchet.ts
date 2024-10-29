import { ErrorRatchet } from "./error-ratchet.js";

/**
 * A dirt simple arg parser - only allows the --x y format
 */
export class SimpleArgRatchet {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static parseArgs(args: string[], validArgNames: string[]): Record<string,string[]> {
    let rval: Record<string,string[]> = {};
    if (args?.length) {
      if ((args.length%2)!==0)
      {
        throw ErrorRatchet.fErr('Invalid arguments, all args must take the form --a b, but there were an odd number of arguments');
      }
      for (let i=0;i<args.length;i+=2) {
        let key: string = args[i];
        let value: string = args[i+1];
        if (!key.startsWith('--')) {
          throw ErrorRatchet.fErr('Argument %s does not take the form --x', key);
        }
        key = key.substring(2);
        if (!validArgNames.includes(key)) {
          throw ErrorRatchet.fErr('Argument %s is not a valid argument (valid were %j)', key, validArgNames);
        }
        rval[key] = rval[key] ?? [];
        rval[key].push(value);
      }
    }
    return rval;
  }

  public static parseSingleArgs(args: string[], validArgNames: string[]): Record<string,string> {
    let tmp: Record<string,string[]> = SimpleArgRatchet.parseArgs(args, validArgNames);
    let rval: Record<string,string> = {};
    Object.keys(tmp).forEach(k=>{
      const v: string[] = tmp[k];
      if (v.length>1) {
        throw ErrorRatchet.fErr('Argument %s had %d values, but should have 1', k, v.length);
      }
      rval[k]=v[0];
    });

    return rval;
  }
}

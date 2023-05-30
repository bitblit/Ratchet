import { StringRatchet } from '@bitblit/ratchet-common';
import { ContextUtil } from '../util/context-util.js';

export class BuiltInTraceIdGenerators {
  public static fullAwsRequestId(): string {
    return ContextUtil.defaultedCurrentRequestId();
  }

  public static shortAwsRequestId(): string {
    let rval: string = BuiltInTraceIdGenerators.fullAwsRequestId();
    if (rval.length > 10) {
      let idx: number = rval.lastIndexOf('-');
      idx = idx === -1 ? rval.length - 10 : idx;
      rval = rval.substring(idx);
    }
    return rval;
  }

  public static fixedLengthHex(length: number = 10): string {
    return StringRatchet.createRandomHexString(length);
  }
}

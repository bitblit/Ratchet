import { NumberRange } from "./number-range.js";

export class CurrencyRatchet {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static pctFormatted(pct: number): string {
    const rval: string =
      pct === null || pct === undefined
        ? 'Null'
        : pct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    return rval;
  }

  public static centToDollarFormat(cents: number): string {
    return CurrencyRatchet.dollarFormat(cents / 100);
  }

  public static dollarFormat(dollars: number): string {
    const rval: string =
      dollars === null || dollars === undefined
        ? 'Null'
        : '$' + dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return rval;
  }

  public static dollarFormatRange(range: NumberRange): string {
    let rval: string = 'N/A';
    if (range) {
      rval = range.low ? CurrencyRatchet.dollarFormat(range.low) : ' ^ ';
      rval += ' - ';
      rval += range.high ? CurrencyRatchet.dollarFormat(range.high) : ' ^ ';
    }
    return rval;
  }

  public static percentFormatRange(range: NumberRange): string {
    let rval: string = 'N/A';
    if (range) {
      rval = range.low ? CurrencyRatchet.pctFormatted(range.low) : ' ^ ';
      rval += ' - ';
      rval += range.high ? CurrencyRatchet.pctFormatted(range.high) : ' ^ ';
    }
    return rval;
  }

}

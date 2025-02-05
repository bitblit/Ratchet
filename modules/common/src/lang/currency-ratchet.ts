import { Range } from './range';

export class CurrencyRatchet {
  // Prevent instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static centToDollarFormat(cents: number, fractionDigits: number = 2): string {
    return CurrencyRatchet.dollarFormat(cents / 100, fractionDigits);
  }

  public static dollarFormat(dollars: number, fractionDigits: number = 2): string {
    const rval: string =
      dollars === null || dollars === undefined
        ? 'Null'
        : '$' + dollars.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
    return rval;
  }

  public static dollarFormatNumberRange(range: Range<number>): string {
    let rval: string = 'N/A';
    if (range) {
      rval = range.low ? CurrencyRatchet.dollarFormat(range.low) : ' ^ ';
      rval += ' - ';
      rval += range.high ? CurrencyRatchet.dollarFormat(range.high) : ' ^ ';
    }
    return rval;
  }
}

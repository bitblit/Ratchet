import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyRatchet } from '@bitblit/ratchet-common/lang/currency-ratchet';

@Pipe({ name: 'acuteDollars', standalone: true })
export class DollarFormattedPipe implements PipeTransform {
  transform(input: number): string {
    const rval: string = input === null || input === undefined ? 'Null' : CurrencyRatchet.dollarFormat(input);
    return rval;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { NumberRatchet } from '@bitblit/ratchet-common/lang/number-ratchet';

@Pipe({ name: 'ngx-acute-percent', standalone: true })
export class PercentFormattedPipe implements PipeTransform {
  transform(input: number): string {
    return NumberRatchet.pctFormatted(input);
  }
}

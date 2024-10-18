import { Pipe, PipeTransform } from '@angular/core';
import {NumberRatchet} from "@bitblit/ratchet-common/lang/number-ratchet";

@Pipe({ name: 'acutePercent'  })
export class PercentFormattedPipe implements PipeTransform {
  transform(input: number): string {
    return NumberRatchet.pctFormatted(input);
  }
}

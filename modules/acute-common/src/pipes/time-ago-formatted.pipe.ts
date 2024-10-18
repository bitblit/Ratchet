import {Pipe, PipeTransform} from '@angular/core';
import {DurationRatchet} from "@bitblit/ratchet-common/lang/duration-ratchet";
import {NumberRatchet} from "@bitblit/ratchet-common/lang/number-ratchet";

@Pipe({ name: 'acuteTimeAgo' })
export class TimeAgoFormattedPipe implements PipeTransform {
  transform(input: number): string {
    return DurationRatchet.formatMsDuration(new Date().getTime() - NumberRatchet.safeNumber(input));
  }
}

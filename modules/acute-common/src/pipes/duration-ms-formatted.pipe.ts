import { Pipe, PipeTransform } from "@angular/core";
import { DurationRatchet } from "@bitblit/ratchet-common/lang/duration-ratchet";
import { StringRatchet } from "@bitblit/ratchet-common/lang/string-ratchet";

@Pipe({ name: "ngxDurationMsFormat", standalone: true })
export class DurationMsFormattedPipe implements PipeTransform {
  transform(ms: number, style: string, includeMS: boolean): string {
    const toFormat: number = ms ? ms : 0;
    let rval: string;
    switch (StringRatchet.trimToEmpty(style)) {
      case "thin":
        rval = DurationRatchet.thinFormatMsDuration(toFormat, includeMS);
        break;
      case "colon":
        rval = DurationRatchet.colonFormatMsDuration(toFormat, includeMS);
        break;
      default:
        rval = DurationRatchet.formatMsDuration(toFormat, includeMS);
        break;
    }
    return rval;
  }

}

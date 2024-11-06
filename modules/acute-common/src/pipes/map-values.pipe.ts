import { Pipe, PipeTransform } from '@angular/core';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

@Pipe({ name: 'ngx-acute-map-values', standalone: true })
export class MapValuesPipe implements PipeTransform {
  transform(value: any, args?: any[]): any[] {
    const returnArray = [];

    for (const k of Object.keys(value)) {
      returnArray.push({
        key: k,
        val: value[k],
      });
    }

    Logger.info('Map values : %j : %j', returnArray, args);
    return returnArray;
  }
}

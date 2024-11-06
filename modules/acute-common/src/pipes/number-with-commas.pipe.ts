import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ngx-acute-number-with-commas', standalone: true })
export class NumberWithCommasPipe implements PipeTransform {
  transform(input: number): string {
    return new Intl.NumberFormat().format(input);
  }
}

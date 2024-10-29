import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'acuteRound', standalone: true })
export class RoundPipe implements PipeTransform {
  transform(input: number): number {
    return Math.round(input);
  }
}

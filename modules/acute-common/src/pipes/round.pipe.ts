import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ngxAcuteRound', standalone: true })
export class RoundPipe implements PipeTransform {
  transform(input: number): number {
    return Math.round(input);
  }
}

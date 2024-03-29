import { Logger } from './logger';

export class TimeoutToken {
  private __timeoutTokenFlagField = true;

  constructor(
    private title: string,
    private timeoutMS: number,
  ) {}

  public writeToLog(): void {
    Logger.warn('Timed out after %d ms waiting for results of %s', this.timeoutMS, this.title);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static isTimeoutToken(value: any): boolean {
    return !!value && !!value['__timeoutTokenFlagField'];
  }
}

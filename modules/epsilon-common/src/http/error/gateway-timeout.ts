import { EpsilonHttpError } from './epsilon-http-error.js';

export class GatewayTimeout<T = void> extends EpsilonHttpError<T> {
  public static readonly HTTP_CODE: number = 504;

  constructor(...errors: string[]) {
    super(...errors);
    this.withHttpStatusCode(GatewayTimeout.HTTP_CODE);
  }
}

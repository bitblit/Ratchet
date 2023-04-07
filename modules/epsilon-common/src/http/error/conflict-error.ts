import { EpsilonHttpError } from './epsilon-http-error.js';

export class ConflictError<T = void> extends EpsilonHttpError<T> {
  public static readonly HTTP_CODE: number = 409;

  constructor(...errors: string[]) {
    super(...errors);
    this.withHttpStatusCode(ConflictError.HTTP_CODE);
  }
}

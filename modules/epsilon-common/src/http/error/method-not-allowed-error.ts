import { RestfulApiHttpError } from '@bitblit/ratchet-common/network/restful-api-http-error';

export class MethodNotAllowedError<T = void> extends RestfulApiHttpError<T> {
  public static readonly HTTP_CODE: number = 405;

  constructor(...errors: string[]) {
    super(...errors);
    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);

    this.withHttpStatusCode(MethodNotAllowedError.HTTP_CODE);
  }
}

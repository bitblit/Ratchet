import { RestfulApiHttpError } from '@bitblit/ratchet-common/network/restful-api-http-error';

export class TooManyRequestsError<T = void> extends RestfulApiHttpError<T> {
  public static readonly HTTP_CODE: number = 429;

  constructor(...errors: string[]) {
    super(...errors);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);

    this.withHttpStatusCode(TooManyRequestsError.HTTP_CODE);
  }
}

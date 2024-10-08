import { RestfulApiHttpError } from '@bitblit/ratchet-common/network/restful-api-http-error';

export class BadGateway<T = void> extends RestfulApiHttpError<T> {
  public static readonly HTTP_CODE: number = 502;

  constructor(...errors: string[]) {
    super(...errors);
    Object.setPrototypeOf(this, BadGateway.prototype);
    this.withHttpStatusCode(BadGateway.HTTP_CODE);
  }
}

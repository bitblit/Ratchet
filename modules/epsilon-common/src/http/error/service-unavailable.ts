import { RestfulApiHttpError } from '@bitblit/ratchet-common/network/restful-api-http-error';

export class ServiceUnavailable<T = void> extends RestfulApiHttpError<T> {
  public static readonly HTTP_CODE: number = 503;

  constructor(...errors: string[]) {
    super(...errors);
    Object.setPrototypeOf(this, ServiceUnavailable.prototype);

    this.withHttpStatusCode(ServiceUnavailable.HTTP_CODE);
  }
}

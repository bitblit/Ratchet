import {RestfulApiHttpError} from "./restful-api-http-error.js";

describe('#restfulApiHttpError', function () {
  it('should check if the error is a given class', async () => {
    const testError: Error = new RestfulApiHttpError('test').withHttpStatusCode(404);
    const nonHttpError: Error = new Error('Not HTTP');
    expect(RestfulApiHttpError.errorIs40x(testError)).toBeTruthy();
    expect(RestfulApiHttpError.errorIs50x(testError)).toBeFalsy();
    expect(RestfulApiHttpError.errorIs40x(nonHttpError)).toBeFalsy();
    expect(RestfulApiHttpError.errorIs50x(testError)).toBeFalsy();
  });
});

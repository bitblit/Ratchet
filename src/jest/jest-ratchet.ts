/*
    Functions for working with Jest
*/
import { Mocked } from 'jest-mock';

export class JestRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // You MUST pass jest.fn into jestDotFn - its to work around how jest isn't allowed to be compiled
  // in to regular code
  public static mock<T>(jestDotFn: () => any): Mocked<T> {
    if (!JestRatchet.currentlyRunningInsideJest()) {
      throw new Error('Cannot mock - not currently inside Jest context');
    }

    const get = function (_, key) {
      if (!this[key]) this[key] = jestDotFn();
      return this[key];
    };
    const proxy = new Proxy({}, { get });
    const cast: Mocked<T> = proxy as Mocked<T>;
    return cast;
  }

  public static currentlyRunningInsideJest(): boolean {
    return JestRatchet.jestWorkerId() !== undefined;
  }

  public static jestWorkerId(): string {
    let rval: string = undefined;
    if (process?.env) {
      rval = process.env['JEST_WORKER_ID'];
    }
    return rval;
  }
}

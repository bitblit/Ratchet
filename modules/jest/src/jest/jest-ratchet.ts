/*
    Functions for working with Jest
*/

export class JestRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static mock<T>(): jest.Mocked<T> {
    const get = function (_, key) {
      if (!this[key]) this[key] = jest.fn();
      return this[key];
    };
    const proxy = new Proxy({}, { get });
    return proxy as unknown as jest.Mocked<T>;
  }
}

import { TimeoutToken } from './timeout-token.js';
import { expect, test, describe } from 'vitest';

describe('#timeoutToken', function () {
  test('should return the correct value for isTimeoutToken', function () {
    const tt: TimeoutToken = new TimeoutToken('title', 20000);
    const ntt: any = { a: 'b' };

    expect(TimeoutToken.isTimeoutToken(tt)).toBeTruthy();
    expect(TimeoutToken.isTimeoutToken(ntt)).toBeFalsy();
  });
});

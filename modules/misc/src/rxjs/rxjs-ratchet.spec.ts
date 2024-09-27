import { BehaviorSubject } from 'rxjs';
import { RxjsRatchet } from './rxjs-ratchet.js';
import { PromiseRatchet } from '@bitblit/ratchet-common/lang/promise-ratchet';
import { Logger } from '@bitblit/ratchet-common/logger/logger';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';

describe('#waitForNonNullOnSubject', function () {
  test('should resolve after 1 second', async () => {
    const sub: BehaviorSubject<number> = new BehaviorSubject<number>(null);
    //const testFn: any =
    PromiseRatchet.wait(1000).then((r) => {
      sub.next(5);
    });

    Logger.info('Waiting for non-null');

    const result: number = await RxjsRatchet.waitForNonNullOnSubject(sub);
    Logger.info('Got %d', result);

    expect(result).toEqual(5);
  }, 10000);
});

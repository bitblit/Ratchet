import { BehaviorSubject } from 'rxjs';
import { RxjsRatchet } from './rxjs-ratchet.js';
import { PromiseRatchet } from '@bitblit/ratchet-common/dist/lang/promise-ratchet.js';
import { Logger } from '@bitblit/ratchet-common/dist/logger/logger.js';

describe('#waitForNonNullOnSubject', function () {
  it('should resolve after 1 second', async () => {
    const sub: BehaviorSubject<number> = new BehaviorSubject<number>(null);
    const testFn: any = PromiseRatchet.wait(1000).then((r) => {
      sub.next(5);
    });

    Logger.info('Waiting for non-null');

    const result: number = await RxjsRatchet.waitForNonNullOnSubject(sub);
    Logger.info('Got %d', result);

    expect(result).toEqual(5);
  }, 10000);
});

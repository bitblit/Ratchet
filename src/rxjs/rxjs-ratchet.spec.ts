import {BehaviorSubject} from 'rxjs';
import {RxjsRatchet} from './rxjs-ratchet';
import {PromiseRatchet} from '../common/promise-ratchet';
import {Logger} from '../common/logger';

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

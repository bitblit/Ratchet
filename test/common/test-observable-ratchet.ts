import { timer } from 'rxjs';
import { expect } from 'chai';
import { ObservableRatchet } from '../../src/common/observable-ratchet';
import { TimeoutToken } from '../../src/common/timeout-token';

describe('#timeout', function () {
  it('should correctly return before timeout', function () {
    const src = timer(1000);
    const timeoutOb = ObservableRatchet.timeout(src, '1000ms interval', 1500);
    timeoutOb.subscribe((result) => expect(result).to.equal(0));
  });

  it('should correctly returns null after timeout', function () {
    const src = timer(1500);
    const timeoutOb = ObservableRatchet.timeout(src, '1500ms interval', 1000);
    timeoutOb.subscribe((result) => {
      expect(result).to.not.be.null;
      expect(result instanceof TimeoutToken).to.be.true;
    });
  });
});

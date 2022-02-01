import {PromiseRatchet} from './promise-ratchet';
import {No} from './no';

describe('#no', function () {
  it('should do nothing', () => {
    PromiseRatchet.wait(100).then(No.op);
  });
});

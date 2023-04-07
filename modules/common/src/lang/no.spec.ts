import { PromiseRatchet } from './promise-ratchet.js';
import { No } from './no.js';

describe('#no', function () {
  it('should do nothing', () => {
    PromiseRatchet.wait(100).then(No.op);
  });
});

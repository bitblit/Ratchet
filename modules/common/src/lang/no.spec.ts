import { PromiseRatchet } from './promise-ratchet.js';
import { No } from './no.js';
import { expect, test, describe } from 'vitest';

describe('#no', function () {
  test('should do nothing', () => {
    PromiseRatchet.wait(100).then(No.op);
  });
});

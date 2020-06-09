import { expect } from 'chai';
import { TransformRatchet } from '../../src/common/transform-ratchet';
import { BuiltInTransforms } from '../../src/common/transform/built-in-transforms';
import { PromiseRatchet } from '../../src/common/promise-ratchet';
import { No } from '../../src/common/no';

describe('#no', function () {
  it('should do nothing', () => {
    PromiseRatchet.wait(100).then(No.op);
  });
});

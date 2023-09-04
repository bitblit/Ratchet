import { Readable } from 'stream';
import { NodeStreamRatchet } from './node-stream-ratchet';

describe('#NodeStreamRatchet', function () {
  it('should wrap a string in a readable', async () => {
    const r: Readable = NodeStreamRatchet.stringToReadable('test');
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(4);
  });

  it('should wrap an number in a readable', async () => {
    const r: Readable = NodeStreamRatchet.anyToStringReadable(401);
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(3);
  });
});

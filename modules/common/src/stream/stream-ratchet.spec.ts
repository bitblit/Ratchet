import { Readable } from 'stream';
import { StreamRatchet } from './stream-ratchet.js';

describe('#StreamRatchet', function () {
  it('should wrap a string in a readable', async () => {
    const r: Readable = StreamRatchet.stringToReadable('test');
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(4);
  });

  it('should wrap an number in a readable', async () => {
    const r: Readable = StreamRatchet.anyToStringReadable(401);
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(3);
  });
});

import { StringReadable } from './string-readable';
import { Readable } from 'stream';

describe('#StringReadable', function () {
  it('should wrap a string in a readable', async () => {
    const r: Readable = StringReadable.stringToReadable('test');
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(4);
  });

  it('should wrap an number in a readable', async () => {
    const r: Readable = StringReadable.anyToStringReadable(401);
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(3);
  });
});

import { Readable } from 'stream';
import { NodeStreamRatchet } from './node-stream-ratchet.js';
import { describe, expect, test } from 'vitest';

describe('#NodeStreamRatchet', function () {
  test('should wrap a string in a readable', async () => {
    const r: Readable = NodeStreamRatchet.stringToReadable('test');
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(4);
  });

  test('should wrap an number in a readable', async () => {
    const r: Readable = NodeStreamRatchet.anyToStringReadable(401);
    const out: Buffer = r.read(200);

    expect(out.length).toEqual(3);
  });
});

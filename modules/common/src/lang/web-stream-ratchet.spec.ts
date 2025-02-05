import { WebStreamRatchet } from './web-stream-ratchet.js';
import { describe, expect, test } from 'vitest';

describe('#WebStreamRatchet', function () {
  test('should roundtrip from string to stream and back', async () => {
    const input = 'test';
    const r: ReadableStream = WebStreamRatchet.stringToWebReadableStream('test');
    const out: string = await WebStreamRatchet.webReadableStreamToString(r);

    expect(input).toEqual(out);
  });
});

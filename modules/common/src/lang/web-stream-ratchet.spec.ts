import { WebStreamRatchet } from './web-stream-ratchet.js';

describe('#WebStreamRatchet', function () {
  it('should roundtrip from string to stream and back', async () => {
    const input: string = 'test';
    const r: ReadableStream = WebStreamRatchet.stringToWebReadableStream('test');
    const out: string = await WebStreamRatchet.webReadableStreamToString(r);

    expect(input).toEqual(out);
  });
});

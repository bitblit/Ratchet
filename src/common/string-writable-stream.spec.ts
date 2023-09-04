import { StringWritableStream } from './string-writable-stream';

describe('#StringWritableStream', function () {
  it('should write cumulatively to a string', async () => {
    const sr: StringWritableStream = new StringWritableStream();
    const callback = () => {
      // Ignore me
    };
    sr._write('a', null, callback);
    sr._write('b', null, callback);
    sr._write('c', null, callback);

    expect(sr.value.length).toEqual(3);
  });
});

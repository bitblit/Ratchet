import { StringWritable } from './string-writable.js';
import { describe, expect, test } from 'vitest';

describe('#StringWritableStream', function () {
  test('should write cumulatively to a string', async () => {
    const sr: StringWritable = new StringWritable();
    const callback = () => {
      // Ignore me
    };
    sr._write('a', null, callback);
    sr._write('b', null, callback);
    sr._write('c', null, callback);

    expect(sr.value.length).toEqual(3);
  });
});

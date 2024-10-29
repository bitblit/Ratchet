import { KeyValue } from './key-value.js';
import { MapRatchet } from './map-ratchet.js';
import { expect, test, describe } from 'vitest';
import { SimpleArgRatchet } from './simple-arg-ratchet.js';

describe('#simpleArgRatchet', function () {
  test('should parse multi arguments', function () {
    const test: string[] = ['--a', 'b', '--c', 'd', '--a', 'e'];
    const out: Record<string, string[]> = SimpleArgRatchet.parseArgs(test, ['a', 'c']);
    expect(out).not.toBeNull;
    expect(out['a'].length).toEqual(2);
    expect(out['c'].length).toEqual(1);
    expect(out['c'][0]).toEqual('d');
  });
});

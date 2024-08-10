import { NetworkRatchet } from './network-ratchet.js';
import { ParsedUrl } from '../lang/parsed-url.js';
import { expect, test, describe } from 'vitest';

describe('#parseUrl', function () {
  test('should parse the url and return correct values', function () {
    const result: ParsedUrl = NetworkRatchet.parseUrl('https://example.com:3000/pathname/?search=test#hash');

    expect(result.protocol).toEqual('https:');
    expect(result.host).toEqual('example.com:3000');
    expect(result.hostname).toEqual('example.com');
    expect(result.port).toEqual('3000');
    expect(result.pathname).toEqual('/pathname/');
    expect(result.search).toEqual('?search=test');
    expect(result.hash).toEqual('#hash');
  });
});

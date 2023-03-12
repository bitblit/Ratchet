import { NetworkRatchet } from './network-ratchet';
import { ParsedUrl } from '../lang/parsed-url';

describe('#parseUrl', function () {
  it('should parse the url and return correct values', function () {
    const result: ParsedUrl = NetworkRatchet.parseUrl('http://example.com:3000/pathname/?search=test#hash');

    expect(result.protocol).toEqual('http:');
    expect(result.host).toEqual('example.com:3000');
    expect(result.hostname).toEqual('example.com');
    expect(result.port).toEqual('3000');
    expect(result.pathname).toEqual('/pathname/');
    expect(result.search).toEqual('?search=test');
    expect(result.hash).toEqual('#hash');
  });
});

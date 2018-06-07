import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import {NetworkRatchet} from "../../src/common/network-ratchet";
import {ParsedUrl} from "../../src/common/parsed-url";

describe('#parseUrl', function() {
    it('should parse the url and return correct values', function() {
        let result : ParsedUrl = NetworkRatchet.parseUrl("http://example.com:3000/pathname/?search=test#hash");

        expect(result.protocol).to.equal('http:');
        expect(result.host).to.equal('example.com:3000');
        expect(result.hostname).to.equal('example.com');
        expect(result.port).to.equal('3000');
        expect(result.pathname).to.equal('/pathname/');
        expect(result.search).to.equal('?search=test');
        expect(result.hash).to.equal('#hash');

    });

});
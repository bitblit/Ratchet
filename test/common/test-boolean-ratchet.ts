import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";

describe('#parseBool', function() {
    it('should parse the string true as true', function() {
        let result = BooleanRatchet.parseBool("true");
        expect(result).to.equal(true);
    });

    it('should parse the string TRUE as true', function() {
        let result = BooleanRatchet.parseBool("TRUE");
        expect(result).to.equal(true);
    });

    it('should parse the boolean true as true', function() {
        let result = BooleanRatchet.parseBool(true);
        expect(result).to.equal(true);
    });

    it('should parse the empty string as false', function() {
        let result = BooleanRatchet.parseBool('');
        expect(result).to.equal(false);
    });

    it('should parse null as false', function() {
        let result = BooleanRatchet.parseBool(null);
        expect(result).to.equal(false);
    });

    it('should parse "asdf" as false', function() {
        let result = BooleanRatchet.parseBool("asdf");
        expect(result).to.equal(false);
    });
});
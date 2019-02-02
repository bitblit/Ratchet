import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import {DateRatchet} from '../../src/common/date-ratchet';

describe('#dateRatchet', function() {
    it('should parse my common date format', function() {
        let dt = DateRatchet.parseDefaultDate('1776-07-04');
        expect(dt.getFullYear()).to.eq(1776);
        expect(dt.getMonth()).to.eq(6); // 0 based
        expect(dt.getDay()).to.eq(4);
    });

    it('should parse us with slashes', function() {
        let dt = DateRatchet.parseCommonUsDate('07/04/1776');
        expect(dt.getFullYear()).to.eq(1776);
        expect(dt.getMonth()).to.eq(6); // 0 based
        expect(dt.getDay()).to.eq(4);
    });

    it('should parse us with dashes', function() {
        let dt = DateRatchet.parseCommonUsDate('07-04-1776');
        expect(dt.getFullYear()).to.eq(1776);
        expect(dt.getMonth()).to.eq(6); // 0 based
        expect(dt.getDay()).to.eq(4);
    });

});


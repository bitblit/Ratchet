import { expect } from 'chai';
import { DurationRatchet } from "../../src/common/duration-ratchet";
import {Histogram} from '../../src/histogram/histogram';

describe('#histogram', function() {
    it('should count the values correctly', function() {
        const histogram: Histogram<string> = new Histogram<string>();

        histogram.update('a');
        histogram.update('a');
        histogram.update('b');
        histogram.update('c');

        expect(histogram.getTotalCount()).to.equal(4);

        expect(histogram.countForValue('a')).to.equal(2);
        expect(histogram.countForValue('b')).to.equal(1);
        expect(histogram.countForValue('c')).to.equal(1);
        expect(histogram.countForValue('d')).to.equal(0);

        expect(histogram.percentForValue('a')).to.equal(.5);
        expect(histogram.percentForValue('b')).to.equal(.25);
        expect(histogram.percentForValue('c')).to.equal(.25);
        expect(histogram.percentForValue('d')).to.equal(0);
    });
});

import { expect } from 'chai';
import {NumberRatchet, Point2d} from '../../src/common/number-ratchet';

describe('#safeToNumber', function() {
    it('should convert "55" to 55', function() {
        let result : number = NumberRatchet.safeNumber("55");
        expect(result).to.equal(55);
    });

    it('should leave 66 alone', function() {
        let result :number = NumberRatchet.safeNumber(66);
        expect(result).to.equal(66);
    });

    it('should return the default when it cannot parse', function() {
        let result : number = NumberRatchet.safeNumber({test:'test'},42);
        expect(result).to.equal(42);
    });

});

describe('#parseCSV', function() {
    it('should convert "1,2,3" to [1,2,3]', function() {
        let result : number[] = NumberRatchet.numberCSVToList('1,2,3');
        expect(result.length).to.equal(3);
    });

    it('should convert " 1, 2,3  " to [1,2,3]', function() {
        let result : number[] = NumberRatchet.numberCSVToList(' 1, 2,3 ');
        expect(result.length).to.equal(3);
    });

    it('should convert " a1, 2,b  " to [2]', function() {
        let result : number[] = NumberRatchet.numberCSVToList(' a1, 2,b  ');
        expect(result.length).to.equal(1);
        expect(result[0]).to.equal(2);
    });

});


describe('#fitCurve', function() {
    it('should fit input to curve', function() {
        const curve: Point2d[] = [
            {x:0,y:50},{x:.5,y:50},{x:.8,y:60},{x:1,y:70},{x:1.2,y: 80},
            {x:1.5,y:90},{x:1.6,y:91},{x:1.7,y:92},{x:1.8,y:93},{x:1.9,y:94},{x:2,y:95},{x:3,y:98},{x:4,y:99},{x:5,y:100}
        ];

        expect(NumberRatchet.fitCurve(curve, -1)).to.eq(50);
        expect(NumberRatchet.fitCurve(curve, 0)).to.eq(50);
        expect(NumberRatchet.fitCurve(curve, .3)).to.eq(50);
        expect(NumberRatchet.fitCurve(curve, .5)).to.eq(50);
        expect(NumberRatchet.fitCurve(curve, .8)).to.eq(60);
        expect(NumberRatchet.fitCurve(curve, 1)).to.eq(70);
        expect(NumberRatchet.fitCurve(curve, 5)).to.eq(100);
        expect(NumberRatchet.fitCurve(curve, 6)).to.eq(100);
        expect(NumberRatchet.fitCurve(curve, 1.65)).to.eq(91.5);

    });

});

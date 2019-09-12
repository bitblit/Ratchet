import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import {GeolocationRatchet} from '../../src/common/geolocation-ratchet';
import {RequireRatchet} from '../../src/common/require-ratchet';

describe('#geolocationRatchet', function() {
    it('should generate the right distance', function() {
        const whLat: number = 38.8976805;
        const whLng: number = -77.0387238;

        const senLat: number = 38.8956636;
        const senLng: number = -77.0269061;

        let result: number = GeolocationRatchet.distanceBetweenLocations(whLat, whLng, senLat, senLng);

        result = parseFloat(result.toFixed(4));
        expect(result).to.equal(.6506);
    });

    it('should generate the right offset', function() {
        const lat: number = 37.26383;
        const miles: number = 1;

        const result: number = GeolocationRatchet.milesToLatLngOffset(miles, lat);
        expect(result).to.equal(55.0509);
    });
});



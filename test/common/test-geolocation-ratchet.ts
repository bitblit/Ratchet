import { expect } from 'chai';
import {
  GeolocationRatchet,
  RatchetGeoLocation,
  RatchetLocationBounds,
  RatchetLocationBoundsMap,
} from '../../src/common/geolocation-ratchet';
import * as fs from 'fs';
import { NumberRatchet } from '../../src/common/number-ratchet';

describe('#geolocationRatchet', function () {
  it('should canonicalize', function () {
    expect(GeolocationRatchet.combineBounds([])).to.be.null;
    expect(GeolocationRatchet.combineBounds(null)).to.be.null;
  });

  it('should canonicalize', function () {
    const bounds: RatchetLocationBounds = {
      origin: {
        lat: 4,
        lng: 3,
      },
      extent: {
        lat: 2,
        lng: 5,
      },
    };

    const result: RatchetLocationBounds = GeolocationRatchet.canonicalizeBounds(bounds);
    expect(result.origin.lat).to.equal(2);
    expect(result.origin.lng).to.equal(3);
    expect(result.extent.lat).to.equal(4);
    expect(result.extent.lng).to.equal(5);
  });

  /*
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

              const result1: number = GeolocationRatchet.degreeOfLatLngInMiles(lat);
              expect(result1).to.equal(55.0509);

              const result2: number = GeolocationRatchet.degreeOfLatLngInMiles(0);
              expect(result2).to.equal(69.172);

              const result3: number = GeolocationRatchet.degreeOfLatLngInMiles(lat*-1);
              expect(result3).to.equal(55.0509);

          });


          it('should generate the right offset', function() {
              const lat: number = 37.26383;
              const miles: number = 1;

              const result1: number = GeolocationRatchet.milesInDegLatLng(miles, lat);
              expect(result1).to.equal(1/55.0509);

              const result2: number = GeolocationRatchet.milesInDegLatLng(miles, 0);
              expect(result2).to.equal(1/69.172);

              const result3: number = GeolocationRatchet.milesInDegLatLng(miles, lat*-1);
              expect(result3).to.equal(1/55.0509);

          });


          it('should cluster', function() {
              const locations: RatchetGeoLocation[] = fs.readFileSync('test/data/sample_geo_locations.csv').toString()
                  .split('\n').map(line => {
                      const vals: string[] = line.split(',');
                      if (!!vals && vals.length === 2) {
                          return {
                              lat: NumberRatchet.safeNumber(vals[0]),
                              lng: NumberRatchet.safeNumber(vals[1])
                          }
                      } else {
                          return null;
                      }
                  }).filter(s => !!s);
              const bounds: RatchetLocationBounds[] = locations.map(l => GeolocationRatchet.locationToBounds(l, 10));
              // Logger.info('Got: %j', locations);
              const reduced: RatchetLocationBounds[] = GeolocationRatchet.clusterGeoBounds(bounds, 2, 5);

              expect(reduced.length).to.be.lte(10);

              Logger.info('Reduced %d to %d', bounds.length, reduced.length);


          });





          it('should build a bounds map', function() {
              const locations: RatchetGeoLocation[] = fs.readFileSync('test/data/sample_geo_locations.csv').toString()
                  .split('\n').map(line => {
                      const vals: string[] = line.split(',');
                      if (!!vals && vals.length === 2) {
                          return {
                              lat: NumberRatchet.safeNumber(vals[0]),
                              lng: NumberRatchet.safeNumber(vals[1])
                          }
                      } else {
                          return null;
                      }
                  }).filter(s => !!s);
              const bounds: RatchetLocationBounds[] = locations.map(l => GeolocationRatchet.locationToBounds(l, 10));
              const mapping: RatchetLocationBoundsMap = GeolocationRatchet.buildRatchetLocationBoundsMap(bounds);

              expect(mapping).to.not.be.null;


          });
       */

  it('should calc point in bounds', function () {
    const locations: RatchetGeoLocation[] = fs
      .readFileSync('test/data/sample_geo_locations.csv')
      .toString()
      .split('\n')
      .map((line) => {
        const vals: string[] = line.split(',');
        if (!!vals && vals.length === 2) {
          return {
            lat: NumberRatchet.safeNumber(vals[0]),
            lng: NumberRatchet.safeNumber(vals[1]),
          };
        } else {
          return null;
        }
      })
      .filter((s) => !!s);
    const bounds: RatchetLocationBounds[] = locations.map((l) => GeolocationRatchet.locationToBounds(l, 10));
    const mapping: RatchetLocationBoundsMap = GeolocationRatchet.buildRatchetLocationBoundsMap(bounds);
    const testPoint1: RatchetGeoLocation = locations[100];
    const testPoint2: RatchetGeoLocation = { lng: 5, lat: 5 };
    const testPoint3: RatchetGeoLocation = {
      lat: 40.7566,
      lng: -73.9887,
    };
    const testPoint4: RatchetGeoLocation = {
      lat: 33.74616,
      lng: -84.3708,
    };
    const testPoint5: RatchetGeoLocation = {
      lat: 37.790336,
      lng: -122.405399,
    };

    const pt1In: boolean = GeolocationRatchet.pointInAnyBound(testPoint1, bounds);
    const pt2In: boolean = GeolocationRatchet.pointInAnyBound(testPoint2, bounds);
    const pt3In: boolean = GeolocationRatchet.pointInAnyBound(testPoint3, bounds);
    const pt4In: boolean = GeolocationRatchet.pointInAnyBound(testPoint4, bounds);
    const pt5In: boolean = GeolocationRatchet.pointInRatchetLocationBoundsMap(testPoint5, mapping);

    expect(pt1In).to.be.true;
    expect(pt2In).to.be.false;
    expect(pt3In).to.be.true;
    expect(pt4In).to.be.true;
    expect(pt5In).to.be.true;
  });
});

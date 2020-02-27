
/*
    Functions for working with geolocations
*/

import {RequireRatchet} from './require-ratchet';
import {NumberRatchet} from './number-ratchet';
import {ErrorRatchet} from './error-ratchet';
import {Logger} from './logger';

export class GeolocationRatchet {

    private constructor(){}

    // Ripped off almost straight from https://www.geodatasource.com/developers/javascript
    // All credit to those original authors
    // Units one of M for miles, K for kilometers, N for nautical miles, F for feet, E for meters
    public static distanceBetweenLocations(lat1:number, lon1:number, lat2:number, lon2:number, unit:string='M') {
        const uU: string = (!!unit)?unit.toUpperCase():'';

        if (['M','K','N','F','E'].indexOf(uU) === -1) {
            throw new Error('Invalid unit');
        }
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            const radlat1:number = Math.PI * lat1/180;
            const radlat2:number = Math.PI * lat2/180;
            const theta:number = lon1-lon2;
            const radtheta:number = Math.PI * theta/180;
            let dist:number = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            if (uU==='F') {dist *= 5280 }
            if (uU==='K') { dist *= 1.609344 }
            if (uU==='E') { dist *= 1609.344}
            if (uU==='N') { dist *= 0.8684 }
            return dist;
        }
    }


    public static distanceBetweenRatchetGeoLocations(loc1: RatchetGeoLocation, loc2: RatchetGeoLocation, unit:string='M') {
        return GeolocationRatchet.distanceBetweenLocations(loc1.lat, loc1.lng, loc2.lat, loc2.lng, unit);
    }

    public static degreeOfLatLngInMiles(latitudeInDecimalDegress:number = 0) {
        // It doesn't matter at what longitude you are. What matters is what latitude you are.
        // Length of 1 degree of Longitude = cosine (latitude in decimal degrees) * length of degree (miles) at equator.
        // Convert your latitude into decimal degrees ~ 37.26383
        // Convert your decimal degrees into radians ~ 0.65038
        // Angle in radians = Angle in degrees x PI / 180
        // Take the cosine of the value in radians ~ 0.79585
        // 1 degree of Longitude = ~0.79585 * 69.172 = ~ 55.051 miles
        const latInRads: number = (latitudeInDecimalDegress * Math.PI) / 180;
        const cosLat: number = Math.cos(latInRads);
        const rval: number = NumberRatchet.safeNumber((cosLat * 69.172).toFixed(4));
        return rval;
    }



    public static milesInDegLatLng(miles: number, latitudeInDecimalDegress:number = 0) {
        RequireRatchet.notNullOrUndefined(miles);
        RequireRatchet.true(miles>=0);
        const degreeInMiles: number = GeolocationRatchet.degreeOfLatLngInMiles(latitudeInDecimalDegress);
        return miles/degreeInMiles;
    }


    public static centerOfBounds(bounds: RatchetLocationBounds): RatchetGeoLocation {
        RequireRatchet.notNullOrUndefined(bounds);
        return {
            lat: (bounds.extent.lat + bounds.origin.lat) / 2,
            lng: (bounds.extent.lng + bounds.origin.lng) / 2
        }
    }

    private static calculateSplits(input:RatchetLocationBounds[], slices:number, field: string): SplitPoint[] {
        RequireRatchet.notNullOrUndefined(input);
        RequireRatchet.notNullOrUndefined(slices);
        RequireRatchet.notNullOrUndefined(field);

        input.sort((a,b) => a.origin[field] - b.origin[field]);
        const centers: RatchetGeoLocation[] = input.map(i => GeolocationRatchet.centerOfBounds(i));
        const vals: number[] = centers.map(c => c[field]);
        const splits: SplitPoint[] = [];
        for (let i=1;i<vals.length;i++) {
            const size:number = vals[i] - vals[i-1];
            if (splits.length < slices) {
                splits.push({idx: i, size: size});
                splits.sort((a,b) => a.size - b.size);
            } else if (size > splits[0].size) {
                splits[0] = {idx: i, size: size};
                splits.sort((a,b) => a.size - b.size);
            } else {
                Logger.silly('Skipping, size : %d, %j', size, splits);
            }
        }
        Logger.info('Splits at : %j', splits);
        splits.sort((a,b) => a.idx - b.idx);
        return splits;
    }

    public static clusterGeoBounds(inputVal: RatchetLocationBounds[], latSlices:number = 2, lngSlices: number = 5): RatchetLocationBounds[] {
        let rval: RatchetLocationBounds[] = null;
        if ((latSlices * lngSlices) < 2) {
            ErrorRatchet.throwFormattedErr('Cannot set slices to less than 2 : %d x %d', latSlices, lngSlices);
        }
        if (!!inputVal) {
            rval = [];
            const input: RatchetLocationBounds[] = Object.assign([], inputVal); // Don't want to modify the original
            input.sort((a,b) => a.origin.lng - b.origin.lng);
            const lngSplits: SplitPoint[] = GeolocationRatchet.calculateSplits(inputVal, lngSlices - 1, 'lng');
            lngSplits.sort((a,b) => a.idx - b.idx);
            for (let i=0;i<=lngSplits.length;i++) {
                const lngStartIdx: number = (i === 0 ) ? 0 : lngSplits[i-1].idx;
                const lngEndIdx: number = (i === lngSplits.length) ? input.length : lngSplits[i].idx;
                const lngBatch: RatchetLocationBounds[] = input.slice(lngStartIdx, lngEndIdx);
                // Now split by lats
                lngBatch.sort((a,b) => a.origin.lat - b.origin.lat);
                const latSplits: SplitPoint[] = GeolocationRatchet.calculateSplits(lngBatch, latSlices - 1, 'lat');
                for (let j=0;j<=latSplits.length;j++) {
                    const latStartIdx: number = (j == 0 ) ? 0 : latSplits[j-1].idx;
                    const latEndIdx: number = (j === latSplits.length) ? lngBatch.length : latSplits[j].idx;
                    const latBatch: RatchetLocationBounds[] = lngBatch.slice(latStartIdx, latEndIdx);
                    rval.push(GeolocationRatchet.combineBounds(latBatch));
                }
            }
            Logger.info('New bounds : %j', rval);

        }

        // const orig: RatchetLocationBounds = GeolocationRatchet.combineBounds(inputVal);
        // const next: RatchetLocationBounds = GeolocationRatchet.combineBounds(rval);
        // Logger.info('P: %j', orig);
        // Logger.info('S: %j', next);

        return rval;
    }

    public static combineBounds(inp: RatchetLocationBounds[]): RatchetLocationBounds {
        const oLat: number[] = inp.map(i => i.origin.lat);
        const rval: RatchetLocationBounds = {
            origin: {
                lat: inp.map(i => i.origin.lat).reduce((a, i) => Math.min(a, i)),
                lng: inp.map(i => i.origin.lng).reduce((a, i) => Math.min(a, i)),
            },
            extent: {
                lat: inp.map(i => i.extent.lat).reduce((a, i) => Math.max(a, i)),
                lng: inp.map(i => i.extent.lng).reduce((a, i) => Math.max(a, i)),
            }
        };
        return rval;
    }

    public static roundLocation(r: RatchetGeoLocation, roundDigits: number): RatchetGeoLocation {
        return {
            lat: NumberRatchet.safeNumber(r.lat.toFixed(roundDigits)),
            lng: NumberRatchet.safeNumber(r.lng.toFixed(roundDigits))
        };
    }

    public static locationToBounds(loc: RatchetGeoLocation, radiusMiles: number): RatchetLocationBounds {
        const offset: number = GeolocationRatchet.milesInDegLatLng(radiusMiles, loc.lat);
        const gfb: RatchetLocationBounds = {
            origin: {
                lat: loc.lat - offset,
                lng: loc.lng - offset
            },
            extent: {
                lat: loc.lat + offset,
                lng: loc.lng + offset
            }
        };
        return gfb;
    }

    public static sameLocation(loc1: RatchetGeoLocation, loc2: RatchetGeoLocation): boolean {
        return !!loc1 && !!loc2 && loc1.lat === loc2.lat && loc1.lng === loc2.lng;
    }
}

export interface RatchetGeoLocation {
    lat: number;
    lng: number;
}

export interface RatchetLocationBounds {
    origin: RatchetGeoLocation;
    extent: RatchetGeoLocation;
}

interface ClusterWorkPackage {
    compositeBound: RatchetLocationBounds;
    boundList: RatchetLocationBounds[];
    center: RatchetGeoLocation;
    roundedCenter: RatchetGeoLocation
}

interface SplitPoint {
    idx: number;
    size: number;
}

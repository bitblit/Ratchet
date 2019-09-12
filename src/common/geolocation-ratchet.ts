
/*
    Functions for working with geolocations
*/

import {RequireRatchet} from './require-ratchet';
import {NumberRatchet} from './number-ratchet';

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


    public static milesToLatLngOffset(miles:number, latitudeInDecimalDegress:number = 0) {
        // It doesn't matter at what longitude you are. What matters is what latitude you are.
        // Length of 1 degree of Longitude = cosine (latitude in decimal degrees) * length of degree (miles) at equator.
        // Convert your latitude into decimal degrees ~ 37.26383
        // Convert your decimal degrees into radians ~ 0.65038
        // Angle in radians = Angle in degrees x PI / 180
        // Take the cosine of the value in radians ~ 0.79585
        // 1 degree of Longitude = ~0.79585 * 69.172 = ~ 55.051 miles
        RequireRatchet.notNullOrUndefined(miles);
        RequireRatchet.true(miles>=0);
        const latInRads: number = (latitudeInDecimalDegress * Math.PI) / 180;
        const cosLat: number = Math.cos(latInRads);
        const rval: number = NumberRatchet.safeNumber((cosLat * 69.172).toFixed(4));
        return rval;
    }
}


/*
    Functions for working with geolocations
*/

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
}

/*
    Functions for working with rxjs objects
*/

import {MapRatchet} from '../common/map-ratchet';

export class RxjsRatchet {

    public static safeUnsubscribe(sub: any):boolean {
        return MapRatchet.safeCallFunction(sub, 'unsubscribe');
    }

}

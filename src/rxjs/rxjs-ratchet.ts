/*
    Functions for working with rxjs objects
*/

import {MapRatchet} from '../common/map-ratchet';
import {BehaviorSubject, Subscription} from 'rxjs';

export class RxjsRatchet {

    public static safeUnsubscribe(sub: any):boolean {
        return MapRatchet.safeCallFunction(sub, 'unsubscribe');
    }

    public static async waitForNonNullOnSubject<T>(subject: BehaviorSubject<T>): Promise<T> {
        if (!!subject.value) {
            return subject.value;
        } else {
            return new Promise<T>((resolve, reject)=>{
                const innerSub: Subscription = subject.subscribe(val=>{
                    if (!!val) {
                        RxjsRatchet.safeUnsubscribe(innerSub);
                        resolve(val);
                    }
                });
            })
        }
    }

    public static async waitForTargetValueOnSubject<T>(subject: BehaviorSubject<T>, targetValue: T): Promise<T> {
        if (subject.value === targetValue) {
            return subject.value;
        } else {
            return new Promise<T>((resolve, reject)=>{
                const innerSub: Subscription = subject.subscribe(val=>{
                    if (val === targetValue) {
                        RxjsRatchet.safeUnsubscribe(innerSub);
                        resolve(val);
                    }
                });
            })
        }

    }

}

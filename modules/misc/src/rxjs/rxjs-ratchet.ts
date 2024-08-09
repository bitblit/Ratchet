/*
    Functions for working with rxjs objects
*/


import { MapRatchet } from "@bitblit/ratchet-common/lang/map-ratchet";
import { BehaviorSubject, Subscription } from "rxjs";

export class RxjsRatchet {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static safeUnsubscribe(sub: any): boolean {
    return MapRatchet.safeCallFunction(sub, 'unsubscribe');
  }

  public static async waitForNonNullOnSubject<T>(subject: BehaviorSubject<T>): Promise<T> {
    if (!!subject.value) {
      return subject.value;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise<T>((resolve, reject) => {
        const innerSub: Subscription = subject.subscribe((val) => {
          if (!!val) {
            RxjsRatchet.safeUnsubscribe(innerSub);
            resolve(val);
          }
        });
      });
    }
  }

  public static async waitForTargetValueOnSubject<T>(subject: BehaviorSubject<T>, targetValue: T): Promise<T> {
    if (subject.value === targetValue) {
      return subject.value;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return new Promise<T>((resolve, reject) => {
        const innerSub: Subscription = subject.subscribe((val) => {
          if (val === targetValue) {
            RxjsRatchet.safeUnsubscribe(innerSub);
            resolve(val);
          }
        });
      });
    }
  }
}

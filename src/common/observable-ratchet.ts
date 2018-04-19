import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { race } from 'rxjs/observable/race';
import {Logger} from "./logger";

/**
 * A class for simplifying working with rxjs observables.
 *
 * Contributed by William Weiss <npm@codification.org>
 */
export class ObservableRatchet {
    public static timeout<T>(
        srcObservable: Observable<T>,
        title: string,
        timeoutMillis: number,
        resolveAsNull: boolean
    ): Observable<T> {
        return race(
            srcObservable,
            this.createTimeoutObservable(title, timeoutMillis, resolveAsNull)
        );
    }

    public static createTimeoutObservable<T>(
        title: string,
        timeoutMillis: number,
        resolveAsNull: boolean
    ): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                Logger.warn(
                    `Timed out after ${timeoutMillis}ms waiting for results of ${title}`
                );
                if (resolveAsNull) {
                    observer.next(null);
                    observer.complete();
                } else {
                    observer.error('Timeout');
                }
            }, timeoutMillis);
        });
    }
}
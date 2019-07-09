import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {race} from 'rxjs/observable/race';
import {TimeoutToken} from './timeout-token';

/**
 * A class for simplifying working with rxjs observables.
 *
 * Contributed by William Weiss <npm@codification.org>
 */
export class ObservableRatchet {
    public static timeout<T>(
        srcObservable: Observable<T | TimeoutToken>,
        title: string,
        timeoutMillis: number
    ): Observable<T | TimeoutToken> {
        return race(
            srcObservable,
            this.createTimeoutObservable(title, timeoutMillis)
        );
    }

    public static createTimeoutObservable<T>(
        title: string,
        timeoutMillis: number
    ): Observable<T | TimeoutToken> {
        return Observable.create((observer: Observer<T | TimeoutToken>) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                observer.next(new TimeoutToken(title, timeoutMillis));
            }, timeoutMillis);
        });
    }
}
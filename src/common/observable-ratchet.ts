import { Observable } from 'rxjs';
import { Observer } from 'rxjs';
import { race } from 'rxjs';
import { TimeoutToken } from './timeout-token';

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
    return race(srcObservable, this.createTimeoutObservable(title, timeoutMillis));
  }

  public static createTimeoutObservable<T>(title: string, timeoutMillis: number): Observable<T | TimeoutToken> {
    return Observable.create((observer: Observer<T | TimeoutToken>) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        observer.next(new TimeoutToken(title, timeoutMillis));
      }, timeoutMillis);
    });
  }
}

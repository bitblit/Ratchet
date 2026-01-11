import { WardenUserServiceEventProcessingProvider } from './provider/warden-user-service-event-processing-provider.js';
import { WardenLoggedInUserWrapper } from './provider/warden-logged-in-user-wrapper.js';
import { BehaviorSubject } from 'rxjs';
import { WardenClientCurrentLoggedInJwtTokenProvider } from './provider/warden-client-current-logged-in-jwt-token-provider.js';
import { WardenUtils } from '../common/util/warden-utils.js';
import { Logger } from '@bitblit/ratchet-common/logger/logger';

/**
 * This class maintains a BehaviorSubject of the current user for things that want to be
 * notified on change without depending on the WardenUserService (most commonly, the
 * API provider with both needs the token for auth'd calls, but also is responsible for
 * doing the login call itself and therefor cannot depend on the UserService which depends
 * on the WardenClient which likely depends on the API provider - prevents a circular
 * dependency to just depend on this)
 *
 * Delegates so that you still can also register other behavior, and just tack this onto it
 *
 * By default this will never serve expired credentials - if a call is made, and the credentials found are
 * expired, they will be cleared and null will be returned
 */
export class WardenDelegatingCurrentUserProvidingUserServiceEventProcessingProvider<T>
  implements WardenUserServiceEventProcessingProvider<T>, WardenClientCurrentLoggedInJwtTokenProvider
{
  private _currentUserSubject: BehaviorSubject<WardenLoggedInUserWrapper> = new BehaviorSubject<WardenLoggedInUserWrapper>(null);

  constructor(
    private wrapped?: Partial<WardenUserServiceEventProcessingProvider<T>>,
    private serveExpiredCredentials: boolean = false,
  ) {}

  public fetchCurrentLoggedInJwtToken(): string {
    let val: WardenLoggedInUserWrapper = this?._currentUserSubject?.getValue();
    if (!this.serveExpiredCredentials && val && WardenUtils.wrapperIsExpired(val)) {
      Logger.info('Current wrapper in the subject is expired - autostripping');
      this.currentUserSubject.next(null);
      val = null;
    }
    return val?.jwtToken;
  }

  public get currentUserSubject(): BehaviorSubject<WardenLoggedInUserWrapper> {
    return this._currentUserSubject;
  }

  public onAutomaticLogout(): void {
    if (this.wrapped) {
      this.wrapped.onAutomaticLogout();
    }
  }

  public onAutomaticTokenRefresh(refreshUser: WardenLoggedInUserWrapper): void {
    if (this?.wrapped?.onAutomaticTokenRefresh) {
      this.wrapped.onAutomaticTokenRefresh(refreshUser);
    }
  }

  public onLoginFailure(reason: string): void {
    if (this?.wrapped?.onLoginFailure) {
      this.wrapped.onLoginFailure(reason);
    }
  }

  public onLogout(): void {
    if (this?.wrapped?.onLogout) {
      this.wrapped.onLogout();
    }
    this.currentUserSubject.next(null);
  }

  public onSuccessfulLogin(newUser: WardenLoggedInUserWrapper): void {
    if (this?.wrapped?.onSuccessfulLogin) {
      this.wrapped.onSuccessfulLogin(newUser);
    }
    this.currentUserSubject.next(newUser);
  }
}

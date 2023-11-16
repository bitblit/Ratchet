import { WardenUserServiceEventProcessingProvider } from './provider/warden-user-service-event-processing-provider.js';
import { WardenLoggedInUserWrapper } from './provider/warden-logged-in-user-wrapper.js';
import { BehaviorSubject } from 'rxjs';
import { WardenClientCurrentLoggedInJwtTokenProvider } from './provider/warden-client-current-logged-in-jwt-token-provider.js';

/**
 * This class maintains a BehaviorSubject of the current user for things that want to be
 * notified on change without depending on the WardenUserService (most commonly, the
 * API provider with both needs the token for auth'd calls, but also is responsible for
 * doing the login call itself and therefor cannot depend on the UserService which depends
 * on the WardenClient which likely depends on the API provider - prevents a circular
 * dependency to just depend on this)
 *
 * Delegates so that you still can also register other behavior, and just tack this onto it
 */
export class WardenDelegatingCurrentUserProvidingUserServiceEventProcessingProvider<T>
  implements WardenUserServiceEventProcessingProvider<T>, WardenClientCurrentLoggedInJwtTokenProvider
{
  private _currentUserSubject: BehaviorSubject<WardenLoggedInUserWrapper<T>> = new BehaviorSubject<WardenLoggedInUserWrapper<T>>(null);

  constructor(private wrapped?: Partial<WardenUserServiceEventProcessingProvider<T>>) {}

  public fetchCurrentLoggedInJwtToken(): string {
    return this?._currentUserSubject?.getValue()?.jwtToken;
  }

  public get currentUserSubject(): BehaviorSubject<WardenLoggedInUserWrapper<T>> {
    return this._currentUserSubject;
  }

  public onAutomaticLogout(): void {
    if (this.wrapped) {
      this.wrapped.onAutomaticLogout();
    }
  }

  public onAutomaticTokenRefresh(refreshUser: WardenLoggedInUserWrapper<T>): void {
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

  public onSuccessfulLogin(newUser: WardenLoggedInUserWrapper<T>): void {
    if (this?.wrapped?.onSuccessfulLogin) {
      this.wrapped.onSuccessfulLogin(newUser);
    }
    this.currentUserSubject.next(newUser);
  }
}

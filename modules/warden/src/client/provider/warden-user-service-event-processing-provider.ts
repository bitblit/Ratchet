import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper';

/**
 * Notifies the containing system when significant events happen
 */

export interface WardenUserServiceEventProcessingProvider<T> {
  onLogout(): void;
  onSuccessfulLogin(newUser: WardenLoggedInUserWrapper<T>): void;
  onLoginFailure(reason: string): void;

  onAutomaticTokenRefresh(refreshUser: WardenLoggedInUserWrapper<T>): void;
  onAutomaticLogout(): void;
}

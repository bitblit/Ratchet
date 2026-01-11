import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper.js';

/**
 * Notifies the containing system when significant events happen
 */

export interface WardenUserServiceEventProcessingProvider<T> {
  onLogout(): void;
  onSuccessfulLogin(newUser: WardenLoggedInUserWrapper): void;
  onLoginFailure(reason: string): void;

  onAutomaticTokenRefresh(refreshUser: WardenLoggedInUserWrapper): void;
  onAutomaticLogout(): void;
}

import { WardenLoggedInUserWrapper } from './warden-logged-in-user-wrapper.js';
import { BehaviorSubject } from "rxjs";

export interface WardenLoggedInUserProvider<T> {
  fetchLoggedInUserWrapper(): WardenLoggedInUserWrapper<T>;
  setLoggedInUserWrapper(wrapper: WardenLoggedInUserWrapper<T>);
  logOutUser(): void;
  loginChangedSubject(): BehaviorSubject<WardenLoggedInUserWrapper<T>>;
}
